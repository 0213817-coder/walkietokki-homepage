// Private drafts stay in this browser; the R2 state remains authoritative after a successful PUT.
let syncBase=null,syncReady=false,syncTimer=null,syncConflict=null,syncPromise=null,draftAvailable=true;
const draftKey='travel-private-draft-v1';
function rememberDraft(){if(!data)return;try{localStorage.setItem(draftKey,JSON.stringify({data,base:syncBase,etag,at:Date.now()}));draftAvailable=true;}catch{draftAvailable=false;}}
function clearDraft(){try{localStorage.removeItem(draftKey);}catch{}}
function syncNotice(message,kind='retry'){
 const n=$('#syncNotice');n.hidden=false;n.innerHTML=`<div><strong>${kind==='conflict'?'변경 내용 확인':kind==='AUTH'?'다시 로그인':'동기화 대기'}</strong><p>${esc(message)}</p><small>${draftAvailable?'현재 기기에 변경 내용을 임시 저장했습니다.':'기기 임시 저장을 사용할 수 없습니다. 이 화면을 닫기 전에 백업해 주세요.'}</small></div><div class="actions">${kind==='AUTH'?'<a href="/travel" target="_blank" rel="noopener">로그인</a>':''}<button id="syncRetry">${kind==='conflict'?'변경 내용 비교':'저장 재시도'}</button></div>`;
 $('#syncRetry').onclick=kind==='conflict'?openSyncConflict:save;
}
function scheduleSave(){clearTimeout(syncTimer);if(syncReady&&!syncConflict)syncTimer=setTimeout(()=>save(),1200);}
changed=function(){dirty=true;$('#saveState').textContent='저장 대기';$('#saveState').className='status accent';rememberDraft();scheduleSave();};
function openSyncConflict(){
 if(!syncConflict)return;const m=mergeTravelState(syncConflict.base,data,syncConflict.remote);
 $('#conflictItems').innerHTML=m.conflicts.map(c=>`<li><b>${esc(c.path.join(' · '))}</b><div><small>내 수정</small><p>${esc(c.local===undefined?'삭제':typeof c.local==='string'?c.local:JSON.stringify(c.local))}</p></div><div><small>다른 기기</small><p>${esc(c.remote===undefined?'삭제':typeof c.remote==='string'?c.remote:JSON.stringify(c.remote))}</p></div></li>`).join('');
 $('#syncConflictDialog').showModal();
}
async function chooseSyncVersion(preference){
 if(!syncConflict)return;data=mergeTravelState(syncConflict.base,data,syncConflict.remote,preference).state;syncBase=copyState(syncConflict.remote);etag=syncConflict.etag;syncConflict=null;$('#syncConflictDialog').close();changed();render();await save();
}
$('#keepLocal').onclick=()=>chooseSyncVersion('local');$('#keepRemote').onclick=()=>chooseSyncVersion('remote');$('#closeSyncConflict').onclick=()=>$('#syncConflictDialog').close();
load=async function(){
 try{
  const response=await fetch('/travel/api/state',{cache:'no-store',credentials:'same-origin'});const incoming=await stateResponse(response);etag=response.headers.get('ETag');if(!etag)throw Error('저장 버전 정보를 받지 못했습니다. 새로고침해 주세요.');
  syncBase=incoming.needsSetup?null:copyState(incoming);data=incoming.needsSetup?null:incoming;
  let draft;try{draft=JSON.parse(localStorage.getItem(draftKey)||'null');}catch{}
  if(draft?.data&&validState(draft.data)&&(!data||(draft.data.trip.start===data.trip.start&&draft.data.trip.end===data.trip.end))){
   if(!data){data=draft.data;dirty=true;}
   else if(draft.base){const merged=mergeTravelState(draft.base,draft.data,data);if(merged.conflicts.length)syncConflict={base:draft.base,remote:copyState(data),etag};data=merged.state;dirty=JSON.stringify(data)!==JSON.stringify(syncBase);}
  }
  syncReady=true;
  if(!data){$('#saveState').textContent='첫 설정';$('#content').innerHTML='<div class="card"><h2>여행 데이터</h2><p>더보기의 데이터 가져오기에서 기존 여행 백업을 선택하세요.</p></div>';return;}
  let stayChanged=false;if(pendingStayUpdate){try{stayChanged=await receiveStayUpdate();}catch(e){notify(e.message);}}let migrated=normalizeFlights(data)||stayChanged;migrated=normalizeCourses(data)||migrated;dirty=dirty||migrated;
  $('#saveState').textContent=dirty?'저장 대기':'동기화 완료';render();
  if(syncConflict){rememberDraft();syncNotice('같은 항목이 다른 기기에서도 수정되었습니다. 비교 후 사용할 내용을 선택하세요.','conflict');}
  else if(dirty){rememberDraft();await save();}
 }catch(error){$('#saveState').textContent='연결 확인';$('#content').innerHTML=`<div class="card"><h2>여행 정보를 불러오지 못했습니다</h2><p>${esc(error.message)}</p>${error.code==='AUTH'?'<a href="/travel" target="_blank" rel="noopener">다시 로그인</a>':''}<button id="reloadTrip">다시 연결</button></div>`;$('#reloadTrip').onclick=load;}
};
save=function(){
 if(syncPromise)return syncPromise;clearTimeout(syncTimer);
 syncPromise=savePending().finally(()=>{syncPromise=null;});return syncPromise;
};
async function savePending(){
 if(!data||!syncReady)return false;if(syncConflict){openSyncConflict();return false;}if(!dirty){notify('동기화 완료');return true;}
 saving=true;$('#saveBtn').disabled=true;$('#saveState').textContent='저장 중';rememberDraft();let succeeded=false;
 try{
  for(let attempt=0;attempt<3;attempt++){
   const snapshot=copyState(data),text=JSON.stringify(snapshot);if(new TextEncoder().encode(text).length>1000000)throw Error('저장 용량(1MB)을 넘었습니다. 코스 좌표나 긴 메모를 줄인 뒤 다시 저장하세요.');
   const response=await fetch('/travel/api/state',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json','If-Match':etag},body:text});
   if(response.status===409){
    const latest=await fetch('/travel/api/state',{cache:'no-store',credentials:'same-origin'}),remote=await stateResponse(latest),nextEtag=latest.headers.get('ETag');
    if(!validState(remote)||!nextEtag)throw Error('최신 저장 정보를 확인하지 못했습니다. 다시 시도하세요.');
    const merged=mergeTravelState(syncBase,data,remote);
    if(merged.conflicts.length){syncConflict={base:copyState(syncBase),remote,etag:nextEtag};rememberDraft();syncNotice('같은 항목이 다른 기기에서도 수정되었습니다. 비교 후 사용할 내용을 선택하세요.','conflict');$('#saveState').textContent='변경 내용 확인';return false;}
    data=merged.state;syncBase=copyState(remote);etag=nextEtag;rememberDraft();continue;
   }
   await stateResponse(response);const nextEtag=response.headers.get('ETag');if(!nextEtag)throw Error('저장 확인 응답이 누락되었습니다. 다시 저장하면 최신 내용과 비교합니다.');
   syncBase=snapshot;etag=nextEtag;dirty=JSON.stringify(data)!==text;succeeded=true;$('#syncNotice').hidden=true;
   $('#saveState').textContent=dirty?'저장 대기':'동기화 완료';$('#saveState').className=dirty?'status accent':'status';if(dirty)rememberDraft();else clearDraft();return true;
  }
  throw Error('다른 기기의 변경이 이어지고 있습니다. 잠시 후 다시 저장하세요.');
 }catch(error){rememberDraft();$('#saveState').textContent=error.code==='AUTH'?'로그인 필요':'저장 재시도';syncNotice(error.message+(error.status?' (HTTP '+error.status+')':''),error.code);return false;}
 finally{saving=false;$('#saveBtn').disabled=false;if(succeeded&&dirty)scheduleSave();}
}
$('#saveBtn').onclick=save;
window.addEventListener('online',()=>{if(dirty&&!syncConflict)save();});
window.addEventListener('pagehide',()=>{if(dirty)rememberDraft();});
