import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {configuration,authorize} from '../travel-app/auth.mjs';
import {validState} from '../travel-app/state.mjs';
import {HTML} from '../travel-app/ui.mjs';
import {onRequest} from '../functions/travel/[[path]].js';
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk={...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'test-key'};
const config={team:'https://test-team.cloudflareaccess.com',aud:'test-audience',email:'owner@example.test'};
const claims={iss:config.team,aud:[config.aud],email:config.email,iat:Math.floor(Date.now()/1000)-10,exp:Math.floor(Date.now()/1000)+600};
const b64=v=>Buffer.from(typeof v==='string'?v:JSON.stringify(v)).toString('base64url');
async function token(changes={},header={alg:'RS256',kid:'test-key'}){const input=b64(header)+'.'+b64({...claims,...changes});return input+'.'+Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(input))).toString('base64url');}
const certs=async()=>new Response(JSON.stringify({keys:[jwk]}));
const req=t=>new Request('https://site.example/travel',{headers:t?{'Cf-Access-Jwt-Assertion':t}:{}});
const fixture=()=>({trip:{title:'Test',start:'2030-01-01',end:'2030-01-02',note:''},notes:'',sources:[],flights:[],hotels:[],places:[],routes:[],packing:[],days:[{id:'2030-01-01',date:'2030-01-01',rideKind:'라이딩',goal:'80–95',morning:'Ride',status:'제안'},{id:'2030-01-02',date:'2030-01-02',rideKind:'휴식',morning:'Rest'}],chargingItems:['Device'],preparation:[{title:'Power',body:'Test'}]});
test('requires complete configuration; rejects missing and forged identity',async()=>{
 assert.equal(configuration({}),null);assert.equal(await authorize(req(),config,certs),false);
 assert.equal(await authorize(req('a.b.c'),config,certs),false);
 assert.equal(await authorize(req(await token()),config,certs),true);
 const tampered=(await token()).split('.');tampered[1]=b64({...claims,exp:claims.exp+100});assert.equal(await authorize(req(tampered.join('.')),config,certs),false);
 const forged=(await token()).split('.');forged[1]=b64({...claims,email:'other@example.test'});assert.equal(await authorize(req(forged.join('.')),config,certs),false);
});
test('validates signed audience, issuer, email, expiry and algorithm',async()=>{
 for(const changes of [{aud:['wrong']},{iss:'https://evil.test'},{email:'other@example.test'},{exp:1},{iat:Date.now()/1000+300},{nbf:Date.now()/1000+300}])assert.equal(await authorize(req(await token(changes)),config,certs),false);
 assert.equal(await authorize(req(await token({},{alg:'none',kid:'test-key'})),config,certs),false);
});
test('API is private, preserves saved state and detects concurrent edits',async()=>{
 const jwt=await token();let saved=null,version=0;
 const env={TRAVEL_ACCESS_TEAM:config.team,TRAVEL_ACCESS_AUD:config.aud,TRAVEL_OWNER_EMAIL:config.email,TRAVEL_STORE:{async get(){return saved?{json:async()=>JSON.parse(saved),httpEtag:'"'+version+'"'}:null;},async put(key,value,options){if(options.onlyIf.etagDoesNotMatch==='*'?saved!==null:options.onlyIf.etagMatches!==String(version))return null;saved=value;version++;return {httpEtag:'"'+version+'"'};}}};
 const call=(path,method='GET',body,extra={})=>onRequest({env,request:new Request('https://site.example'+path,{method,headers:{'Cf-Access-Jwt-Assertion':jwt,...extra},...(body?{body:JSON.stringify(body)}:{})})});
 assert.equal((await onRequest({env:{},request:req()})).status,503);
 assert.equal((await onRequest({env,request:req()})).status,401);
 const page=await call('/travel');assert.equal(page.status,200);assert.match(page.headers.get('Cache-Control'),/no-store/);
 assert.deepEqual(await (await call('/travel/api/state')).json(),{needsSetup:true});
 assert.equal((await call('/travel/api/state','PUT',fixture(),{'If-Match':'"initial"',Origin:'https://evil.test'})).status,403);
 assert.equal((await call('/travel/api/state','PUT',fixture(),{Origin:'https://site.example'})).status,428);
 const h={Origin:'https://site.example','If-Match':'"initial"'};
 assert.equal((await call('/travel/api/state','PUT',fixture(),h)).status,200);
 assert.equal((await call('/travel/api/state','PUT',fixture(),h)).status,409);
 assert.equal((await call('/travel/api/state')).headers.get('ETag'),'"1"');
 assert.deepEqual(await (await call('/travel/api/state')).json(),fixture());
 const next=fixture();next.notes='updated';assert.equal((await call('/travel/api/state','PUT',next,{...h,'If-Match':'"1"'})).status,200);
 assert.equal((await call('/travel/api/state','PUT',{bad:true},{...h,'If-Match':'"2"'})).status,400);
 assert.equal((await call('/travel/api/state','PUT',{...next,notes:'x'.repeat(1000001)},{...h,'If-Match':'"2"'})).status,413);
 assert.equal((await call('/travel/api/state','DELETE')).status,405);
 assert.equal((await call('/travel/private.json')).status,404);
});
test('validates backups and renders the monthly calendar without private seed',()=>{
 const f=fixture();assert.ok(validState(f));f.days[0].id='x" onclick="bad';assert.equal(validState(f),false);
 const script=HTML.match(/<script>([\s\S]*)<\/script>/)[1];new vm.Script(script);
 const elements=new Map();const c=vm.createContext({document:{querySelector:s=>{if(!elements.has(s))elements.set(s,{showModal(){},close(){},insertAdjacentHTML(){}});return elements.get(s)},querySelectorAll:()=>[]},location:{hash:''},history:{replaceState(){}},window:{addEventListener(){},scrollTo(){}},setTimeout:()=>0,fetch:async()=>({ok:true,json:async()=>({needsSetup:true}),headers:new Headers()}),console});
 vm.runInContext(script.replace(/\nload\(\);/,'\n'),c);c.fixture=fixture();vm.runInContext('data=fixture;',c);
 for(const page of ['home','flights','hotels','places','routes','days','packing','notes'])assert.ok(vm.runInContext('views.'+page+'()',c).length>100);
 const cal=vm.runInContext('calendar()',c);assert.match(cal,/2030년 01월/);assert.equal((cal.match(/data-date=/g)||[]).length,2);
 assert.match(HTML,/\/travel\/api\/state/);assert.ok(!HTML.includes('const SEED='));
});
