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
 const elements=new Map();const c=vm.createContext({document:{addEventListener(){},querySelector:s=>{if(!elements.has(s))elements.set(s,{showModal(){},close(){},insertAdjacentHTML(){}});return elements.get(s)},querySelectorAll:()=>[]},location:{hash:''},history:{replaceState(){},pushState(){}},window:{addEventListener(){},scrollTo(){}},setTimeout:()=>0,fetch:async()=>({ok:true,json:async()=>({needsSetup:true}),headers:new Headers()}),console});
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
 const script=HTML.match(/<script>([\s\S]*)<\/script>/)[1];const elements=new Map();const c=vm.createContext({URL,document:{addEventListener(){},querySelector:s=>{if(!elements.has(s))elements.set(s,{showModal(){},close(){},insertAdjacentHTML(){}});return elements.get(s)},querySelectorAll:()=>[]},location:{hash:''},history:{replaceState(){},pushState(){}},window:{addEventListener(){},scrollTo(){}},setTimeout:()=>0,fetch:async()=>({ok:true,json:async()=>({needsSetup:true}),headers:new Headers()}),console});
 vm.runInContext(script.replace(/\nload\(\);/,'\n'),c);const f=fixture();f.flights=[{id:'f1',name:'KE683',seat:'31A',departure:'2030-01-01 18:45 · ICN',arrival:'2030-01-01 22:45 · CNX',baggagePieces:2}];f.places=[{id:'p1',name:'<script>alert(1)</script>',kind:'식당'}];f.routes=[{id:'r1',name:'Route',url:'https://www.strava.com/routes/123',distance:'90.8',elevation:'1200'}];c.fixture=f;vm.runInContext('data=fixture;',c);
 const flight=vm.runInContext('views.flights()',c);assert.match(flight,/31A/);assert.match(flight,/2개/);assert.match(flight,/18:45/);
 const place=vm.runInContext('placeResults()',c);assert.doesNotMatch(place,/<script>alert/);assert.match(place,/Google 지도/);assert.match(place,/사진 미등록/);
 assert.match(vm.runInContext('routeResults()',c),/90.8/);assert.match(vm.runInContext('routeResults()',c),/1,200/);
 vm.runInContext("showRoute('r1')",c);assert.match(elements.get('#content').innerHTML,/strava-embeds.com\/route\/123/);assert.doesNotMatch(elements.get('#content').innerHTML,/미등록|2025 계획/);
});

import {mergeTravelState,stateResponse} from '../travel-app/sync-utils.mjs';
import {normalizeCourses,courseCategory} from '../travel-app/course-utils.mjs';
test('course migration fills verified metrics without overwriting edits or inventing flat terrain',()=>{
 const state={routes:[{id:'a',name:'Samoeng Mini XL',url:'https://www.strava.com/routes/7630897',year:'2025 계획',distance:'',elevation:''},{id:'b',name:'Fast ride',distance:'100',elevation:''}]};
 assert.equal(normalizeCourses(state),true);assert.equal(state.routes[0].distance,'86.7');assert.equal(state.routes[0].elevation,'1782');assert.equal(state.routes[0].year,'');assert.equal(state.routes[0].category,'산악 중장거리');assert.equal(courseCategory(state.routes[1]),'분류 대기');
 state.routes[0].distance='87';assert.equal(normalizeCourses(state),false);assert.equal(state.routes[0].distance,'87');
});
test('three-way merge keeps edits from both devices and identifies only conflicting fields',()=>{
 const base=fixture();base.flights=[{id:'f1',seat:'11A',note:''}];base.packing=[{id:'p1',done:false}];
 const local=structuredClone(base),remote=structuredClone(base);local.flights[0].seat='12A';remote.packing[0].done=true;
 const merged=mergeTravelState(base,local,remote);assert.equal(merged.conflicts.length,0);assert.equal(merged.state.flights[0].seat,'12A');assert.equal(merged.state.packing[0].done,true);
 remote.flights[0].seat='13A';const conflict=mergeTravelState(base,local,remote);assert.deepEqual(conflict.conflicts[0].path,['flights','f1','seat']);assert.equal(conflict.conflicts.length,1);
 assert.equal(mergeTravelState(base,local,remote,'remote').state.flights[0].seat,'13A');assert.equal(mergeTravelState(base,local,remote,'local').state.packing[0].done,true);
});
test('merge preserves additions and deletes without resurrecting records or dropping remote edits',()=>{
 const base=fixture();base.routes=[{id:'a',name:'A'},{id:'b',name:'B'}];
 const l=structuredClone(base),r=structuredClone(base);l.routes.shift();l.routes.push({id:'c',name:'C'});r.routes[1].name='BB';r.routes.push({id:'d',name:'D'});
 const m=mergeTravelState(base,l,r);assert.equal(m.conflicts.length,0);assert.deepEqual(m.state.routes.map(x=>x.id),['b','d','c']);assert.equal(m.state.routes[0].name,'BB');
 r.routes[0].name='AA';assert.equal(mergeTravelState(base,l,r).conflicts.length,1);
});
test('HTML authentication redirects and server errors produce recoverable messages',async()=>{
 await assert.rejects(()=>stateResponse(new Response('<html>login</html>',{headers:{'Content-Type':'text/html'}})),e=>e.code==='AUTH');
 await assert.rejects(()=>stateResponse(new Response('login',{status:401})),e=>e.code==='AUTH');
 await assert.rejects(()=>stateResponse(new Response(JSON.stringify({error:'Conflict'}),{status:409,headers:{'Content-Type':'application/json'}})),e=>e.status===409);
 assert.deepEqual(await stateResponse(new Response('{"ok":true}',{headers:{'Content-Type':'application/json'}})),{ok:true});
});
test('cleared optional baggage field does not reject the whole travel state',()=>{
 const s=fixture();s.flights=[{id:'f1',baggagePieces:''}];assert.equal(validState(s),true);s.flights[0].baggagePieces='-1';assert.equal(validState(s),false);
});
function syncHarness(server){
 const nodes=new Map(),storage=new Map(),events={},timers=new Map(),requests=[];let version=1,stored=structuredClone(server),puts=0,mode='normal',timerId=0,release;
 const c=vm.createContext({URL,TextEncoder,Headers,Response,AbortController,clearTimeout:id=>timers.delete(id),setTimeout:(fn,delay)=>{const id=++timerId;timers.set(id,{fn,delay});return id;},localStorage:{setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)||null,removeItem:k=>storage.delete(k)},document:{addEventListener:(k,fn)=>events[k]=fn,visibilityState:'visible',querySelector:s=>{if(!nodes.has(s))nodes.set(s,{showModal(){},close(){},insertAdjacentHTML(){}});return nodes.get(s);},querySelectorAll:()=>[]},location:{hash:''},history:{replaceState(){},pushState(){}},window:{scrollTo(){},addEventListener:(k,fn)=>events[k]=fn},fetch:async(url,opts={})=>{
 requests.push({url,opts});
 if(mode==='hang')return new Promise((resolve,reject)=>opts.signal.addEventListener('abort',()=>reject(Error('Aborted'))));
 if(mode==='delay'&&opts.method==='PUT')await new Promise(resolve=>{release=resolve;});
 if(opts.method==='PUT'){puts++;if(mode==='auth')return new Response('<html>login</html>',{headers:{'Content-Type':'text/html'}});if(mode==='network')throw Error('network');if(mode==='reject')return new Response('{}',{status:409,headers:{'Content-Type':'application/json'}});if(opts.headers['If-Match']!=='"'+version+'"')return new Response('{}',{status:409,headers:{'Content-Type':'application/json'}});stored=JSON.parse(opts.body);version++;return new Response('{"ok":true}',{headers:{'Content-Type':'application/json',ETag:(mode==='cdn'?'W/':'')+'"'+version+'"',...(mode==='cdn'?{'X-Travel-Version':'"'+version+'"'}:{})}});}
 return new Response(JSON.stringify(stored),{headers:{'Content-Type':'application/json',ETag:(mode==='cdn'?'W/':'')+'"'+version+'"',...(mode==='cdn'?{'X-Travel-Version':'"'+version+'"'}:{})}});
 }});
 vm.runInContext(HTML.match(/<script>([\s\S]*)<\/script>/)[1].replace(/\nload\(\);/,'\n'),c);
 return {c,nodes,storage,events,requests,runTimers(delay){for(const [id,t] of [...timers])if(t.delay===delay){timers.delete(id);t.fn();}},release(){release();},remoteEdit(fn){fn(stored);version++;},mode(v){mode=v;},get stored(){return stored;},get puts(){return puts;}};
}
test('client retries a stale version, merges disjoint changes and recovers after authentication expires',async()=>{
 const h=syncHarness(fixture());await vm.runInContext('load()',h.c);
 h.remoteEdit(s=>{s.trip.title='Remote title';});vm.runInContext("data.notes='Local note';changed();",h.c);assert.equal(await vm.runInContext('save()',h.c),true);assert.equal(h.stored.trip.title,'Remote title');assert.equal(h.stored.notes,'Local note');
 h.mode('auth');vm.runInContext("data.notes='Keep this draft';changed();",h.c);assert.equal(await vm.runInContext('save()',h.c),false);assert.match(h.nodes.get('#syncNotice').innerHTML,/로그인/);assert.ok(h.storage.size);
 h.mode('normal');assert.equal(await vm.runInContext('save()',h.c),true);assert.equal(h.stored.notes,'Keep this draft');assert.equal(h.storage.size,0);
});
test('same-field conflicts wait for a choice, then resume saving without permanently blocking',async()=>{
 const h=syncHarness(fixture());await vm.runInContext('load()',h.c);h.remoteEdit(s=>{s.notes='Remote';});vm.runInContext("data.notes='Local';changed();",h.c);
 assert.equal(await vm.runInContext('save()',h.c),false);assert.equal(h.stored.notes,'Remote');assert.match(h.nodes.get('#syncNotice').innerHTML,/변경 내용 비교/);
 await vm.runInContext("chooseSyncVersion('local')",h.c);assert.equal(h.stored.notes,'Local');vm.runInContext("data.notes='Next';changed();",h.c);assert.equal(await vm.runInContext('save()',h.c),true);assert.equal(h.stored.notes,'Next');
});
import {applyStayUpdate,decodeStayUpdate} from '../travel-app/private-update.mjs';
test('private stay update matches all bookings, preserves original records and is idempotent',()=>{
 const s=fixture();s.hotels=[{id:'h1',reference:'Agoda 111',checkin:'2030-01-01',checkout:'2030-01-03',note:'Original room and paid amount'}];const before=JSON.stringify(s.hotels);
 const p={id:'sample',kind:'stay-confirmation',hotelName:'Test hotel',room:'Twin',checkin:'2030-01-01',checkout:'2030-01-03',confirmedAt:'2030-01-01',message:'Same room confirmed',bookings:[{reference:'111',checkin:'2030-01-01',checkout:'2030-01-03'}]};
 assert.equal(applyStayUpdate(s,p),true);assert.equal(JSON.stringify(s.hotels),before);assert.equal(s.stayConfirmation.room,'Twin');assert.equal(applyStayUpdate(s,p),false);
 const wrong=fixture();wrong.hotels=s.hotels;assert.throws(()=>applyStayUpdate(wrong,{...p,bookings:[{...p.bookings[0],reference:'999'}]}));assert.equal(wrong.stayConfirmation,undefined);
});
test('encrypted updates require the correct key and authenticated ciphertext',async()=>{
 const key=crypto.getRandomValues(new Uint8Array(32)),iv=crypto.getRandomValues(new Uint8Array(12)),aes=await crypto.subtle.importKey('raw',key,'AES-GCM',false,['encrypt']);const bytes=await crypto.subtle.encrypt({name:'AES-GCM',iv},aes,new TextEncoder().encode('{"sample":true}'));
 const envelope={version:1,iv:Buffer.from(iv).toString('base64url'),ciphertext:Buffer.from(bytes).toString('base64url')};assert.deepEqual(await decodeStayUpdate(envelope,Buffer.from(key).toString('base64url')),{sample:true});
 await assert.rejects(()=>decodeStayUpdate(envelope,Buffer.alloc(32).toString('base64url')));const tampered=Buffer.from(bytes);tampered[0]^=1;await assert.rejects(()=>decodeStayUpdate({...envelope,ciphertext:tampered.toString('base64url')},Buffer.from(key).toString('base64url')));
});
test('failed saves restore the private draft after reload',async()=>{
 const h=syncHarness(fixture());await vm.runInContext('load()',h.c);h.mode('network');vm.runInContext("data.notes='Offline retained';changed();",h.c);assert.equal(await vm.runInContext('save()',h.c),false);
 vm.runInContext('data=undefined;syncReady=false;dirty=false;',h.c);await vm.runInContext('load()',h.c);assert.equal(vm.runInContext('data.notes',h.c),'Offline retained');h.mode('normal');assert.equal(await vm.runInContext('save()',h.c),true);assert.equal(h.stored.notes,'Offline retained');
});

test('every state request asks Access for 401 without following a login redirect',async()=>{
 const h=syncHarness(fixture());await vm.runInContext('load()',h.c);
 vm.runInContext("data.notes='AJAX';changed();",h.c);await vm.runInContext('save()',h.c);
 for(const {url,opts} of h.requests){assert.equal(url,'/travel/api/state');assert.equal(opts.headers['X-Requested-With'],'XMLHttpRequest');assert.equal(opts.redirect,'manual');assert.equal(opts.credentials,'same-origin');}
 assert.equal(h.requests.at(-1).opts.headers['If-Match'],'"2"');
 await assert.rejects(()=>stateResponse({type:'opaqueredirect',status:0,headers:new Headers()}),e=>e.code==='AUTH');
});
test('stalled mobile saves time out, retain the draft and can retry',async()=>{
 const h=syncHarness(fixture());await vm.runInContext('load()',h.c);h.mode('hang');vm.runInContext("data.notes='Slow connection';changed();",h.c);
 const pending=vm.runInContext('save()',h.c);assert.equal(h.nodes.get('#saveBtn').disabled,true);h.runTimers(15000);
 assert.equal(await pending,false);assert.equal(h.nodes.get('#saveBtn').disabled,false);assert.match(h.nodes.get('#syncNotice').innerHTML,/연결이 지연/);assert.ok(h.storage.size);
 h.mode('normal');assert.equal(await vm.runInContext('save()',h.c),true);assert.equal(h.stored.notes,'Slow connection');
});
test('login resumes in the same tab at the current course and stops repeated auth saves',async()=>{
 const h=syncHarness(fixture());await vm.runInContext('load()',h.c);h.mode('auth');vm.runInContext("location.hash='#routes/ride_1';data.notes='Continue after login';changed();",h.c);
 assert.equal(await vm.runInContext('save()',h.c),false);const notice=h.nodes.get('#syncNotice').innerHTML;
 assert.match(notice,/href="\/travel#routes\/ride_1"/);assert.doesNotMatch(notice,/target="_blank"/);
 const puts=h.puts;vm.runInContext("data.notes+='!';changed();",h.c);h.runTimers(1200);assert.equal(h.puts,puts);
 h.mode('normal');await vm.runInContext('load()',h.c);assert.equal(h.stored.notes,'Continue after login!');assert.equal(h.storage.size,0);
});
test('app return retries pending edits and edits made during a save are not lost',async()=>{
 const h=syncHarness(fixture());await vm.runInContext('load()',h.c);h.mode('network');vm.runInContext("data.notes='Pending';changed();",h.c);await vm.runInContext('save()',h.c);
 h.mode('normal');await h.events.focus();assert.equal(h.stored.notes,'Pending');
 h.mode('delay');vm.runInContext("data.notes='First';changed();",h.c);const pending=vm.runInContext('save()',h.c);
 vm.runInContext("data.notes='Second';changed();",h.c);h.mode('normal');h.release();await pending;
 assert.equal(h.stored.notes,'First');assert.equal(vm.runInContext('dirty',h.c),true);
 h.runTimers(1200);await vm.runInContext('syncPromise',h.c);assert.equal(h.stored.notes,'Second');assert.equal(h.storage.size,0);
});
test('first-import draft is not silently discarded when another device has saved',async()=>{
 const h=syncHarness(fixture()),draft=fixture();draft.notes='Import draft';h.storage.set('travel-private-draft-v1',JSON.stringify({data:draft,base:null,etag:'"initial"'}));
 await vm.runInContext('load()',h.c);assert.equal(vm.runInContext('data.notes',h.c),'Import draft');assert.match(h.nodes.get('#syncNotice').innerHTML,/변경 내용 비교/);assert.equal(h.stored.notes,'');
 await vm.runInContext("chooseSyncVersion('local')",h.c);assert.equal(h.stored.notes,'Import draft');
});
test('course list stays three columns and details expose saved metrics before embeds load',async()=>{
 const state=fixture();state.routes=[{id:'ride_1',name:'싸몽 루프',category:'산악 중장거리',distance:'75',elevation:'1500',url:'https://www.strava.com/routes/123',note:'Detailed climb notes'}];
 const h=syncHarness(state);await vm.runInContext('load()',h.c);const list=vm.runInContext('views.routes()',h.c);
 assert.match(list,/리커버리/);assert.match(list,/평지 중장거리/);assert.match(list,/산악 중장거리/);assert.match(list,/싸몽 루프/);assert.match(list,/1,500/);assert.equal((list.match(/<th scope=/g)||[]).length,3);assert.doesNotMatch(list,/iframe|Detailed climb notes/);
 vm.runInContext("showRoute('ride_1')",h.c);const detail=h.nodes.get('#content').innerHTML;
 assert.match(detail,/75 km/);assert.match(detail,/1,500 m/);assert.match(detail,/Detailed climb notes/);assert.match(detail,/strava-embeds/);
});

test('a compression-weakened response ETag does not cause false R2 write conflicts',async()=>{
 const jwt=await token();await authorize(req(jwt),config,certs);
 let saved=fixture(),version='0123456789abcdef0123456789abcdef',writes=0;
 const env={TRAVEL_ACCESS_TEAM:config.team,TRAVEL_ACCESS_AUD:config.aud,TRAVEL_OWNER_EMAIL:config.email,TRAVEL_STORE:{
  async get(){return {json:async()=>structuredClone(saved),etag:version,httpEtag:'"'+version+'"'};},
  async put(key,body,options){if(options.onlyIf.etagMatches!==version)return null;saved=JSON.parse(body);version='fedcba9876543210fedcba9876543210';writes++;return {etag:version,httpEtag:'"'+version+'"'};}
 }};
 const call=(method,body,extra={})=>onRequest({env,request:new Request('https://site.example/travel/api/state',{method,headers:{'Cf-Access-Jwt-Assertion':jwt,Origin:'https://site.example',...extra},...(body?{body:JSON.stringify(body)}:{})})});
 const response=await call('GET'),original=response.headers.get('ETag');
 const updated=fixture();updated.notes='Phone edit';
 // The CDN changes only the HTTP representation validator, not the stored object's revision.
 const legacy=await call('PUT',updated,{'If-Match':'W/'+original});
 assert.equal(legacy.status,200);assert.equal(writes,1);assert.equal(saved.notes,'Phone edit');
 assert.equal(response.headers.get('X-Travel-Version'),original);
 const current=legacy.headers.get('X-Travel-Version');assert.equal(current,'"'+version+'"');
 updated.notes='Modern client';assert.equal((await call('PUT',updated,{'X-Travel-Version':current,'If-Match':'W/'+original})).status,200);
 assert.equal((await call('PUT',updated,{'X-Travel-Version':original})).status,409);
 assert.equal((await call('PUT',updated,{'X-Travel-Version':'*'})).status,400);
 assert.equal((await call('PUT',updated,{'If-Match':'"a", "b"'})).status,400);
});

test('client uses the unmodified app revision when HTTP ETag is weakened',async()=>{
 const h=syncHarness(fixture());h.mode('cdn');await vm.runInContext('load()',h.c);
 vm.runInContext("data.notes='Saved from phone';changed();",h.c);assert.equal(await vm.runInContext('save()',h.c),true);
 assert.equal(h.stored.notes,'Saved from phone');assert.equal(h.requests.at(-1).opts.headers['X-Travel-Version'],'"2"');assert.equal(h.storage.size,0);
});
test('an unchanged server revision rejection does not loop or blame another device',async()=>{
 const h=syncHarness(fixture());await vm.runInContext('load()',h.c);h.mode('reject');const before=h.puts;
 vm.runInContext("data.notes='Retain failed save';changed();",h.c);assert.equal(await vm.runInContext('save()',h.c),false);
 assert.equal(h.puts,before+1);assert.ok(h.storage.size);assert.doesNotMatch(h.nodes.get('#syncNotice').innerHTML,/다른 기기/);
 h.mode('normal');assert.equal(await vm.runInContext('save()',h.c),true);assert.equal(h.stored.notes,'Retain failed save');
});
