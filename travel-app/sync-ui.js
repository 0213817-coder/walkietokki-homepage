// Private drafts stay in this browser; the R2 state remains authoritative after a successful PUT.
let syncBase=null,syncReady=false,syncTimer=null,syncConflict=null,syncPromise=null,draftAvailable=true,syncAuthNeeded=false,syncLoadPromise=null;
const draftKey='travel-private-draft-v1';
function loginHref(){const hash=location.hash||'';return '/travel'+(/^#(?:home|days|routes(?:\/[A-Za-z0-9_-]+)?|places|flights|hotels|packing|notes)$/.test(hash)?hash:'');}
function rememberDraft(){if(!data)return;try{localStorage.setItem(draftKey,JSON.stringify({data,base:syncBase,etag,at:Date.now()}));draftAvailable=true;}catch{draftAvailable=false;}}
function clearDraft(){try{localStorage.removeItem(draftKey);}catch{}}
function syncNotice(message,kind='retry'){
 const n=$('#syncNotice');n.hidden=false;n.innerHTML=`<div><strong>${kind==='conflict'?'변경 내용 확인':kind==='AUTH'?'다시 로그인':'동기화 대기'}</strong><p>${esc(message)}</p><small>${draftAvailable?'현재 기기에 변경 내용을 임시 저장했습니다.':'기기 임시 저장을 사용할 수 없습니다. 이 화면을 닫기 전에 백업해 주세요.'}</small></div><div class="actions">${kind==='AUTH'?`<a href="${esc(loginHref())}">로그인하고 이어서 저장</a>`:''}<button id="syncRetry">${kind==='conflict'?'변경 내용 비교':'저장 재시도'}</button><button id="syncBackup">백업</button></div>`;
 $('#syncRetry').onclick=kind==='conflict'?openSyncConflict:save;$('#syncBackup').onclick=()=>$('#exportBtn').click();
}
function scheduleSave(){clearTimeout(syncTimer);if(syncReady&&!syncConflict&&!syncAuthNeeded)syncTimer=setTimeout(()=>save(),1200);}
changed=function(){dirty=true;$('#saveState').textContent=syncAuthNeeded?'기기 보관 · 로그인 필요':'저장 대기';$('#saveState').className='status accent';rememberDraft();scheduleSave();};
function openSyncConflict(){
 if(!syncConflict)return;const m=mergeTravelState(syncConflict.base,data,syncConflict.remote);
 $('#conflictItems').innerHTML=m.conflicts.map(c=>`<li><b>${esc(c.path.join(' · '))}</b><div><small>내 수정</small><p>${esc(c.local===undefined?'삭제':typeof c.local==='string'?c.local:JSON.stringify(c.local))}</p></div><div><small>다른 기기</small><p>${esc(c.remote===undefined?'삭제':typeof c.remote==='string'?c.remote:JSON.stringify(c.remote))}</p></div></li>`).join('');
 $('#syncConflictDialog').showModal();
}
async function chooseSyncVersion(preference){
 if(!syncConflict)return;data=mergeTravelState(syncConflict.base,data,syncConflict.remote,preference).state;syncBase=copyState(syncConflict.remote);etag=syncConflict.etag;syncConflict=null;$('#syncConflictDialog').close();changed();render();await save();
}
$('#keepLocal').onclick=()=>chooseSyncVersion('local');$('#keepRemote').onclick=()=>chooseSyncVersion('remote');$('#closeSyncConflict').onclick=()=>$('#syncConflictDialog').close();
load=function(){if(syncLoadPromise)return syncLoadPromise;syncLoadPromise=loadTravel().finally(()=>{syncLoadPromise=null;});return syncLoadPromise;};
async function loadTravel(){
 try{
  const result=await requestTravelState(),incoming=result.body;etag=result.etag;
  if(!incoming||(!incoming.needsSetup&&!validState(incoming)))throw Error('여행 데이터 형식을 확인하지 못했습니다. 다시 연결해 주세요.');
  syncAuthNeeded=false;syncConflict=null;dirty=false;$('#syncNotice').hidden=true;
  syncBase=incoming.needsSetup?null:copyState(incoming);data=incoming.needsSetup?null:incoming;
  let draft;try{draft=JSON.parse(localStorage.getItem(draftKey)||'null');}catch{}
  if(draft?.data&&validState(draft.data)&&(!data||(draft.data.trip.start===data.trip.start&&draft.data.trip.end===data.trip.end))){
   if(!data){data=draft.data;dirty=true;}
   else {const base=draft.base||null,merged=mergeTravelState(base,draft.data,data);if(merged.conflicts.length)syncConflict={base,remote:copyState(data),etag};data=merged.state;dirty=JSON.stringify(data)!==JSON.stringify(syncBase);}
  }
  syncReady=true;
  if(!data){$('#saveState').textContent='첫 설정';$('#content').innerHTML='<div class="card"><h2>여행 데이터</h2><p>더보기의 데이터 가져오기에서 기존 여행 백업을 선택하세요.</p></div>';return;}
  let stayChanged=false;if(pendingStayUpdate){try{stayChanged=await receiveStayUpdate();}catch(e){notify(e.message);}}let migrated=normalizeFlights(data)||stayChanged;migrated=normalizeCourses(data)||migrated;dirty=dirty||migrated;
  $('#saveState').textContent=dirty?'저장 대기':'동기화 완료';render();
  if(syncConflict){rememberDraft();syncNotice('같은 항목이 다른 기기에서도 수정되었습니다. 비교 후 사용할 내용을 선택하세요.','conflict');}
  else if(dirty){rememberDraft();await save();}
 }catch(error){syncAuthNeeded=error.code==='AUTH';$('#saveState').textContent=syncAuthNeeded?'로그인 필요':'연결 확인';$('#content').innerHTML=`<div class="card"><h2>여행 정보를 불러오지 못했습니다</h2><p>${esc(error.message)}</p>${error.code==='AUTH'?`<a href="${esc(loginHref())}">로그인하고 계속하기</a>`:''}<button id="reloadTrip">다시 연결</button></div>`;$('#reloadTrip').onclick=load;}
}
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
   let result;try{result=await requestTravelState({method:'PUT',headers:{'Content-Type':'application/json','X-Travel-Version':etag,'If-Match':etag},body:text});}
   catch(error){
    if(error.status!==409)throw error;
    const latest=await requestTravelState(),remote=latest.body,nextEtag=latest.etag;
    if(!validState(remote)||!nextEtag)throw Error('최신 저장 정보를 확인하지 못했습니다. 다시 시도하세요.');
    if(nextEtag===etag&&JSON.stringify(remote)===JSON.stringify(syncBase))throw Error('서버가 저장을 승인하지 못했습니다. 변경 내용은 이 기기에 보관했습니다. 잠시 후 다시 시도해 주세요.');
    const merged=mergeTravelState(syncBase,data,remote);
    if(merged.conflicts.length){syncConflict={base:copyState(syncBase),remote,etag:nextEtag};rememberDraft();syncNotice('같은 항목이 다른 기기에서도 수정되었습니다. 비교 후 사용할 내용을 선택하세요.','conflict');$('#saveState').textContent='변경 내용 확인';return false;}
    data=merged.state;syncBase=copyState(remote);etag=nextEtag;rememberDraft();continue;
   }
   syncBase=snapshot;etag=result.etag;syncAuthNeeded=false;dirty=JSON.stringify(data)!==text;succeeded=true;$('#syncNotice').hidden=true;
   $('#saveState').textContent=dirty?'저장 대기':'동기화 완료';$('#saveState').className=dirty?'status accent':'status';if(dirty)rememberDraft();else clearDraft();return true;
  }
  throw Error('저장 버전을 확인하지 못했습니다. 변경 내용은 이 기기에 보관했습니다. 잠시 후 다시 시도해 주세요.');
 }catch(error){syncAuthNeeded=error.code==='AUTH';rememberDraft();$('#saveState').textContent=syncAuthNeeded?'로그인 필요':'저장 재시도';syncNotice(error.message+(error.status?' (HTTP '+error.status+')':''),error.code);return false;}
 finally{saving=false;$('#saveBtn').disabled=false;if(succeeded&&dirty)scheduleSave();}
}
$('#saveBtn').onclick=save;
window.addEventListener('online',()=>{if(dirty&&!syncConflict)save();});
window.addEventListener('pagehide',()=>{if(dirty)rememberDraft();});
// iOS may suspend timers while the user switches apps or logs in. Resume pending edits on return.
function resumeTravel(){if(!syncReady)return load();if(dirty&&!syncConflict)return save();}
window.addEventListener('pageshow',e=>{if(e.persisted)resumeTravel();});
window.addEventListener('focus',resumeTravel);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')resumeTravel();else if(dirty)rememberDraft();});
