import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createLocalTrip} from '../travel-app/local-store.mjs';
import {validState} from '../travel-app/state.mjs';
const html=fs.readFileSync(new URL('../public/ridebook/index.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*)<\/script>/)[1].replace(/\nload\(\);/,'\n');
const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
const fixture=()=>createLocalTrip('2030-01-01','2030-01-03','Test');
function harness(shared={record:null},storage=new Map()){
 const elements=new Map(),timers=new Map();let n=0;
 const node=s=>{if(!elements.has(s))elements.set(s,{hidden:false,textContent:'',innerHTML:'',value:'',disabled:false,showModal(){},close(){},insertAdjacentHTML(){},click(){this.onclick?.();}});return elements.get(s);};
 const c=vm.createContext({document:{querySelector:node,querySelectorAll:()=>[],addEventListener(){}},location:{hash:''},history:{replaceState(){},pushState(){}},window:{addEventListener(){},scrollTo(){}},navigator:{},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},setTimeout:fn=>{timers.set(++n,fn);return n;},clearTimeout:id=>timers.delete(id),TextEncoder,console,confirm:()=>true,fetch:()=>{throw Error('Unexpected network request');},readRecord:async()=>clone(shared.record),commitRecord:async(state,revision)=>{if(shared.fail)throw Error('disk full');if(shared.beforeCommit)await shared.beforeCommit();if((shared.record?.revision||0)!==revision)return {ok:false,record:clone(shared.record)};shared.record={data:clone(state),revision:revision+1};return {ok:true,record:clone(shared.record)};}});
 vm.runInContext(script,c);vm.runInContext('readRidebookRecord=readRecord;commitRidebookRecord=commitRecord;',c);
 return {c,storage,shared,elements,run:s=>vm.runInContext(s,c),async import(state=fixture()){c.incoming=clone(state);await vm.runInContext('load();',c);await vm.runInContext('importLocalState(incoming)',c);}};
}
test('public standalone shell contains no private API or private seed',()=>{
 new vm.Script(script);assert.doesNotMatch(html,/\/travel\/api\/state|const SEED=|TRAVEL_OWNER_EMAIL/);assert.match(html,/\/ridebook\/manifest.webmanifest/);assert.match(html,/기기 간 자동 동기화는 사용하지 않습니다/);
 const m=JSON.parse(fs.readFileSync(new URL('../public/ridebook/manifest.webmanifest',import.meta.url)));assert.equal(m.display,'standalone');assert.equal(m.scope,'/ridebook/');assert.equal(m.start_url,'/ridebook/');
});
test('blank trips validate dates and create inclusive days without bookings',()=>{
 const f=fixture();assert.ok(validState(f));assert.equal(f.days.length,3);assert.equal(f.days[2].date,'2030-01-03');assert.deepEqual(f.hotels,[]);assert.throws(()=>createLocalTrip('2030-02-30','2030-03-01'));assert.throws(()=>createLocalTrip('2030-01-03','2030-01-01'));assert.throws(()=>createLocalTrip('2030-01-01','2030-12-31'));
});
test('import, edit and reload persist locally with zero network access',async()=>{
 const h=harness();await h.import();await h.run("data.notes='Offline edit';changed();save()");assert.equal(h.shared.record.data.notes,'Offline edit');assert.equal(h.storage.size,0);
 const next=harness(h.shared,h.storage);await next.run('load()');assert.equal(next.run('data.notes'),'Offline edit');assert.equal(next.elements.get('#saveState').textContent,'기기 저장 완료');assert.equal(next.run('dirty'),false);
});
test('failed disk save retains draft and recovers it on reload',async()=>{
 const h=harness();await h.import();h.shared.fail=true;assert.equal(await h.run("data.notes='Keep me';changed();save()"),false);assert.ok(h.storage.has('ridebook-private-draft-v1'));assert.equal(h.elements.get('#saveState').textContent,'저장 재시도');
 const next=harness(h.shared,h.storage);await next.run('load()');assert.equal(next.run('data.notes'),'Keep me');h.shared.fail=false;assert.equal(await next.run('save()'),true);assert.equal(h.shared.record.data.notes,'Keep me');
});
test('separate tab edits merge while same-field conflicts await user choice',async()=>{
 const shared={record:null},a=harness(shared);await a.import();const b=harness(shared);await b.run('load()');await a.run("data.notes='First';changed();save()");await b.run("data.days[0].morning='Ride';changed();save()");assert.equal(shared.record.data.notes,'First');assert.equal(shared.record.data.days[0].morning,'Ride');
 await a.run("data.notes='Current tab';changed();save()");const result=await b.run("data.notes='Second tab';changed();save()");assert.equal(result,false);assert.ok(b.run('localConflict'));assert.equal(shared.record.data.notes,'Current tab');await b.run("chooseLocalConflict('local')");assert.equal(shared.record.data.notes,'Second tab');assert.equal(shared.record.data.days[0].morning,'Ride');
});
test('edits made during a write remain dirty and persist on the next save',async()=>{
 const h=harness();await h.import();let release;h.shared.beforeCommit=()=>new Promise(r=>release=r);const pending=h.run("data.notes='First edit';changed();save()");h.run("data.notes='Later edit';changed()");h.shared.beforeCommit=null;release();await pending;assert.equal(h.run('dirty'),true);assert.ok(h.storage.has('ridebook-private-draft-v1'));await h.run('save()');assert.equal(h.shared.record.data.notes,'Later edit');assert.equal(h.run('dirty'),false);
});
test('explicit backup import waits for an in-flight save and does not lose replacement',async()=>{
 const h=harness();await h.import();let release;h.shared.beforeCommit=()=>new Promise(r=>release=r);const pending=h.run("data.notes='old';changed();save()");h.c.incoming={...fixture(),notes:'replacement'};const imported=h.run('importLocalState(incoming)');h.shared.beforeCommit=null;release();await pending;await imported;assert.equal(h.shared.record.data.notes,'replacement');
});
test('invalid backups leave the saved trip untouched',async()=>{
 const h=harness();await h.import();const previous=clone(h.shared.record);h.c.incoming={trip:{}};await assert.rejects(h.run('importLocalState(incoming)'));assert.deepEqual(h.shared.record,previous);
});
test('handoff keeps staged data after failure and removes it only after durable save',async()=>{
 const h=harness();await h.run('load()');h.storage.set('ridebook-transfer-v1',JSON.stringify({data:fixture()}));h.run('offerTransfer(readTransfer())');h.shared.fail=true;await h.elements.get('#acceptTransfer').onclick();assert.ok(h.storage.has('ridebook-transfer-v1'));h.shared.fail=false;await h.elements.get('#acceptTransfer').onclick();assert.equal(h.storage.has('ridebook-transfer-v1'),false);assert.ok(h.shared.record);
});
test('service worker caches shell only, serves it offline, and activates updates on request',async()=>{
 const source=fs.readFileSync(new URL('../public/ridebook/sw.js',import.meta.url),'utf8'),events={},cacheData=new Map(),deleted=[];let skipped=0,claimed=0,network=0;
 const cache={async addAll(requests){for(const r of requests)cacheData.set(new URL(r.url).pathname,'cached:'+new URL(r.url).pathname);},async match(path){return cacheData.get(path);}};
 class LocalRequest{constructor(path){this.url='https://example.test'+path;}}
 const c=vm.createContext({self:{location:{origin:'https://example.test'},addEventListener:(name,fn)=>events[name]=fn,skipWaiting:()=>skipped++,clients:{claim:async()=>claimed++}},caches:{open:async()=>cache,keys:async()=>['ridebook-old','unrelated-cache',vm.runInContext('CACHE',c)],delete:async key=>deleted.push(key)},Request:LocalRequest,URL,fetch:()=>{network++;throw Error('offline');}});
 vm.runInContext(source,c);let work;events.install({waitUntil:p=>work=p});await work;assert.equal(skipped,0);assert.equal(cacheData.size,5);events.activate({waitUntil:p=>work=p});await work;assert.deepEqual(deleted,['ridebook-old']);assert.equal(claimed,1);
 for(const path of ['/ridebook/','/ridebook/index.html']){let response;events.fetch({request:{method:'GET',url:'https://example.test'+path},respondWith:r=>response=r});assert.equal(await response,'cached:/ridebook/');}
 for(const path of ['/travel/api/state','/travel','/secret.json']){events.fetch({request:{method:'GET',url:'https://example.test'+path},respondWith:()=>assert.fail('private route intercepted')});}assert.equal(network,0);events.message({data:{type:'ACTIVATE'}});assert.equal(skipped,1);
});
