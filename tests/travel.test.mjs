import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {configuration,authorize} from '../travel-app/auth.mjs';
import {validState} from '../travel-app/state.mjs';
import {HTML} from '../travel-app/ui.mjs';
import {onRequest} from '../functions/travel/[[path]].js';
import {routeIdentity,seatNumber,normalizeFlights,analyzeTrack} from '../travel-app/route-utils.mjs';
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

test('flight correction preserves seat numbers, notes and later edits',()=>{
 const d={flights:[{name:'대한항공 KE683',note:'일반석 · 무료수하물 1개.\n좌석번호: 31A · 기내식 메모'},{name:'KE684',seatNumber:'28J',baggagePieces:3,note:'귀국편 메모'}]};
 assert.equal(normalizeFlights(d),true);assert.equal(d.flights[0].baggagePieces,2);assert.equal(d.flights[0].seat,'31A');assert.match(d.flights[0].note,/기내식 메모/);assert.doesNotMatch(d.flights[0].note,/수하물 1개/);
 assert.equal(d.flights[1].seat,'28J');assert.equal(d.flights[1].baggagePieces,3);
 d.flights[0].seat='32A';d.flights[0].baggagePieces=4;assert.equal(normalizeFlights(d),false);assert.equal(d.flights[0].seat,'32A');assert.equal(d.flights[0].baggagePieces,4);
 assert.equal(seatNumber({note:'좌석 예약 완료'}),'');assert.equal(seatNumber({note:'SEAT: 24 k'}),'24K');
});
test('Strava routes require a canonical URL and preserve 64-bit IDs as strings',()=>{
 assert.deepEqual(routeIdentity('https://www.strava.com/routes/3430444204511276988'),{type:'route',id:'3430444204511276988'});
 assert.equal(routeIdentity('https://www.strava.com/athletes/12345/training/log'),null);
 assert.equal(routeIdentity('https://strava.com.evil.test/routes/1'),null);
 assert.equal(routeIdentity('javascript:alert(1)'),null);
});
test('GPX metrics measure all points, separate track segments and distinguish missing elevation',()=>{
 const track=[[[0,0,100],[0,.01,120],[0,.02,110]],[[1,1,50],[1,1.01,60]]];const m=analyzeTrack(track);
 assert.equal(m.distance,'3.3');assert.equal(m.elevation,'30');assert.equal(m.minElevation,50);assert.equal(m.maxElevation,120);assert.equal(m.geometry.length,2);assert.ok(m.profile.length);
 const missing=analyzeTrack([[[0,0,null],[0,.01,10]]]);assert.equal(missing.elevation,'');assert.equal(missing.elevationComplete,false);
 assert.throws(()=>analyzeTrack([[[100,0,5],[1,0,6]]]));assert.throws(()=>analyzeTrack([]));
 const big=analyzeTrack([Array.from({length:10000},(_,i)=>[18,98+i/100000,100])]);assert.ok(big.geometry.flat().length<=1200);assert.ok(big.profile.length<=400);assert.equal(big.elevation,'0');
});
test('route geometry and baggage schema reject invalid or excessively large records',()=>{
 const s=fixture();s.routes=[{id:'r1',geometry:[[[18,98],[19,99]]],profile:[[0,100],[1,120]]}];assert.equal(validState(s),true);
 s.routes[0].geometry[0][0][0]='bad';assert.equal(validState(s),false);
 s.routes=[];s.flights=[{id:'f1',baggagePieces:'2'}];assert.equal(validState(s),true);s.flights[0].baggagePieces='-1';assert.equal(validState(s),false);
});
test('new cards escape text, show actual metrics and construct bounded map URLs',()=>{
 const script=HTML.match(/<script>([\s\S]*)<\/script>/)[1];const elements=new Map();const c=vm.createContext({URL,document:{querySelector:s=>{if(!elements.has(s))elements.set(s,{showModal(){},close(){},insertAdjacentHTML(){}});return elements.get(s)},querySelectorAll:()=>[]},location:{hash:''},history:{replaceState(){}},window:{addEventListener(){},scrollTo(){}},setTimeout:()=>0,fetch:async()=>({ok:true,json:async()=>({needsSetup:true}),headers:new Headers()}),console});
 vm.runInContext(script.replace(/\nload\(\);/,'\n'),c);const f=fixture();f.flights=[{id:'f1',name:'KE683',seat:'31A',departure:'2030-01-01 18:45 · ICN',arrival:'2030-01-01 22:45 · CNX',baggagePieces:2}];f.places=[{id:'p1',name:'<script>alert(1)</script>',kind:'식당'}];f.routes=[{id:'r1',name:'Route',url:'https://www.strava.com/routes/123',distance:'90.8',elevation:'1200'}];c.fixture=f;vm.runInContext('data=fixture;',c);
 const flight=vm.runInContext('views.flights()',c);assert.match(flight,/31A/);assert.match(flight,/2개/);assert.match(flight,/18:45/);
 const place=vm.runInContext('placeResults()',c);assert.doesNotMatch(place,/<script>alert/);assert.match(place,/Google 지도/);assert.match(place,/사진 미등록/);
 assert.match(vm.runInContext('routeResults()',c),/90.8/);assert.match(vm.runInContext('routeResults()',c),/1200/);
 vm.runInContext("showRoute('r1')",c);assert.match(elements.get('#routeBody').innerHTML,/strava-embeds.com\/route\/123/);
});
