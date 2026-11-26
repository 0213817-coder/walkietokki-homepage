// Private data is stored only in the current browser/app. The public shell has no seed.
let ridebookDatabase;
export function openRidebookDatabase(){
 if(ridebookDatabase)return ridebookDatabase;
 ridebookDatabase=new Promise((resolve,reject)=>{
  if(typeof indexedDB==='undefined'){reject(Error('이 브라우저에서 기기 저장을 사용할 수 없습니다.'));return;}
  const request=indexedDB.open('ridebook-private-v1',1);
  request.onupgradeneeded=()=>{request.result.createObjectStore('records');};
  request.onerror=()=>reject(Error('기기 저장 공간을 열지 못했습니다.'));
  request.onblocked=()=>reject(Error('다른 여행 앱 창을 닫고 다시 열어 주세요.'));
  request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();ridebookDatabase=null;};resolve(db);};
 }).catch(e=>{ridebookDatabase=null;throw e;});return ridebookDatabase;
}
export async function readRidebookRecord(){
 const db=await openRidebookDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction('records','readonly'),request=tx.objectStore('records').get('trip');let value;request.onsuccess=()=>{value=request.result||null;};tx.oncomplete=()=>resolve(value);tx.onerror=tx.onabort=()=>reject(Error('저장된 여행을 읽지 못했습니다.'));});
}
export async function commitRidebookRecord(state,expectedRevision){
 const snapshot=JSON.parse(JSON.stringify(state));const db=await openRidebookDatabase();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction('records','readwrite'),store=tx.objectStore('records'),request=store.get('trip');let result;
  request.onsuccess=()=>{const current=request.result||null;if((current?.revision||0)!==expectedRevision){result={ok:false,record:current};return;}const record={revision:expectedRevision+1,data:snapshot,updatedAt:new Date().toISOString()};store.put(record,'trip');result={ok:true,record};};
  tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(Error('기기 저장에 실패했습니다. 저장 공간을 확인하고 현재 내용을 백업해 주세요.'));
 });
}
export function createLocalTrip(start,end,title='나의 여행'){
 const check=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
 if(!check(start)||!check(end)||end<start)throw Error('여행 시작일과 종료일을 확인해 주세요.');
 const count=Math.round((Date.parse(end)-Date.parse(start))/86400000)+1;if(count>90)throw Error('한 여행은 90일 이내로 설정해 주세요.');
 return {trip:{title,start,end,note:''},notes:'',sources:[],flights:[],hotels:[],places:[],routes:[],packing:[],days:Array.from({length:count},(_,i)=>{const date=new Date(Date.parse(start)+i*86400000).toISOString().slice(0,10);return {id:date,date,rideKind:'휴식',status:'미정',morning:'',afternoon:'',dinner:'',note:''};})};
}
