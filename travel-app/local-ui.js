// This entry point uses device storage only.
let localBase=null,localRevision=0,localSaveTimer,localSavePromise,localConflict=null,draftAvailable=true;
const draftKey='ridebook-private-draft-v1',transferKey='ridebook-transfer-v1';
let localReady=false,pwaWaiting=null,installPrompt=null;
function rememberLocalDraft(){if(!data)return;try{localStorage.setItem(draftKey,JSON.stringify({data,base:localBase,revision:localRevision}));draftAvailable=true;}catch{draftAvailable=false;}}
function localMessage(message){$('#syncNotice').hidden=false;$('#syncNotice').innerHTML=`<div><strong>기기 저장 확인</strong><p>${esc(message)}</p></div><div class="actions"><button id="retryLocal">저장 재시도</button><button id="backupLocal">백업</button></div>`;$('#retryLocal').onclick=()=>localReady?save():load();$('#backupLocal').onclick=()=>$('#exportBtn').click();}
changed=function(){dirty=true;rememberLocalDraft();$('#saveState').textContent='기기에 저장 중';clearTimeout(localSaveTimer);localSaveTimer=setTimeout(()=>save(),200);};
function migrateLocal(){normalizeFlights(data);normalizeCourses(data);addRecoveryCourses(data);}
load=async function(){
 try{
  const record=await readRidebookRecord();localRevision=record?.revision||0;localBase=record?.data?copyState(record.data):null;data=record?.data||null;localReady=true;
  let draft;try{draft=JSON.parse(localStorage.getItem(draftKey)||'null');}catch{}
  if(draft?.data&&validState(draft.data)){
   if(!data){data=draft.data;dirty=true;}
   else{const m=mergeTravelState(draft.base,draft.data,data);if(m.conflicts.length)localConflict={base:draft.base,remote:copyState(data),revision:localRevision};data=m.state;dirty=JSON.stringify(data)!==JSON.stringify(localBase);}
  }
  if(data&&!validState(data))throw Error('저장된 여행의 형식을 확인하지 못했습니다. 백업을 불러와 주세요.');
  if(data){migrateLocal();await receiveStayUpdate();dirty=dirty||JSON.stringify(data)!==JSON.stringify(localBase);render();if(localConflict){showLocalConflict();}else if(dirty)await save();else $('#saveState').textContent='기기 저장 완료';}
  else showLocalWelcome();
  const transfer=readTransfer();if(transfer)offerTransfer(transfer);
 }catch(error){$('#saveState').textContent='저장 확인';localMessage(error.message);if(!data)showLocalWelcome();}
};
function showLocalWelcome(){
 $('#nav').innerHTML='';$('#saveState').textContent=localReady?'기기 저장 준비':'저장 확인';$('#content').innerHTML=`<section class="journey-hero"><div class="journey-heading"><span class="eyebrow">WEB + APP</span><h1>치앙마이,<br>나의 속도로.</h1><p>로그인 없이 열고, 여행은 내 기기에.</p></div></section><section class="card local-welcome"><h2>기존 여행을 가져오세요</h2><p>일정·코스·예약·메모가 들어 있는 백업 파일을 한 번 선택하면, 다음부터 바로 열립니다.</p><div class="actions"><button id="welcomeImport" class="primary">백업 파일 가져오기</button><a href="/travel#app-transfer">기존 사이트에서 옮기기</a></div><p class="section-intro">기존 사이트에서 옮길 때만 기존 로그인이 필요합니다. 이 앱에서 읽고 수정할 때는 필요하지 않습니다.</p><details><summary>빈 여행으로 시작</summary><form id="newTripForm"><label>여행 이름<input id="newTripName" value="나의 여행" required></label><div class="formgrid"><label>시작일<input id="newTripStart" type="date" required></label><label>종료일<input id="newTripEnd" type="date" required></label></div><button type="submit" class="primary">여행 만들기</button></form></details></section><section class="card local-welcome"><h2>휴대폰에서는 홈 화면에</h2><p>iPhone: Safari의 공유 메뉴에서 ‘홈 화면에 추가’를 선택하세요. Android: 브라우저 메뉴에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택하세요.</p><p>최초 온라인 실행 후 ‘오프라인 준비 완료’를 확인하세요. 지도·외부 사진·Strava는 인터넷이 필요합니다.</p></section>`;
 $('#welcomeImport').onclick=()=>$('#importFile').click();$('#newTripForm').onsubmit=async e=>{e.preventDefault();try{const state=createLocalTrip($('#newTripStart').value,$('#newTripEnd').value,$('#newTripName').value);if(!localReady)throw Error('기기 저장을 사용할 수 없습니다. 브라우저 저장 설정을 확인해 주세요.');if(data&&!confirm('현재 내용을 빈 여행으로 바꿀까요?'))return;data=state;migrateLocal();changed();if(await save())render();}catch(e){notify(e.message);}};
}
function readTransfer(){try{const p=JSON.parse(localStorage.getItem(transferKey)||'null');return p&&validState(p.data)?p:null;}catch{return null;}}
function offerTransfer(transfer){$('#syncNotice').hidden=false;$('#syncNotice').innerHTML=`<div><strong>기존 여행을 옮길 준비가 됐어요</strong><p>${esc(transfer.data.trip.start)} — ${esc(transfer.data.trip.end)} · 코스 ${transfer.data.routes.length}개</p><p>${data?'현재 기기 여행을 백업한 뒤 가져오세요.':'가져오면 이 기기에서 로그인 없이 사용할 수 있어요.'}</p></div><div class="actions"><button id="acceptTransfer">이 여행 가져오기</button><button id="dismissTransfer">나중에</button></div>`;$('#acceptTransfer').onclick=async()=>{if(data&&!confirm('현재 기기의 여행을 바꿉니다. 필요한 내용은 백업했나요?'))return;try{await importLocalState(transfer.data);localStorage.removeItem(transferKey);}catch(e){localMessage(e.message);}};$('#dismissTransfer').onclick=()=>{$('#syncNotice').hidden=true;};}
async function importLocalState(incoming){
 if(!validState(incoming))throw Error('여행 백업 형식이 아닙니다.');if(!localReady)throw Error('기기 저장을 사용할 수 없습니다.');
 // Rebase an explicit whole-backup replacement on the latest local revision.
 clearTimeout(localSaveTimer);if(localSavePromise)await localSavePromise;clearTimeout(localSaveTimer);const latest=await readRidebookRecord();localBase=latest?.data||null;localRevision=latest?.revision||0;localConflict=null;
 data=copyState(incoming);migrateLocal();changed();render();if(!await save())throw Error('가져온 내용이 아직 저장되지 않았습니다. 백업 원본을 보관하고 재시도하세요.');
}
function showLocalConflict(){localMessage('다른 앱 창에서도 같은 내용을 수정했습니다. 저장할 내용을 비교해 주세요.');$('#retryLocal').textContent='변경 내용 비교';$('#retryLocal').onclick=()=>{const m=mergeTravelState(localConflict.base,data,localConflict.remote);$('#conflictItems').innerHTML=m.conflicts.map(x=>`<li><b>${esc(x.path.join(' · '))}</b><p>현재 창: ${esc(JSON.stringify(x.local))}</p><p>저장된 내용: ${esc(JSON.stringify(x.remote))}</p></li>`).join('');$('#syncConflictDialog').showModal();};}
async function chooseLocalConflict(preference){if(!localConflict)return;data=mergeTravelState(localConflict.base,data,localConflict.remote,preference).state;localBase=copyState(localConflict.remote);localRevision=localConflict.revision;localConflict=null;$('#syncConflictDialog').close();changed();render();await save();}
save=function(){if(localSavePromise)return localSavePromise;clearTimeout(localSaveTimer);localSavePromise=saveLocalPending().finally(()=>{localSavePromise=null;if(dirty&&!localConflict&&localLastSaveOK)changed();});return localSavePromise;};
let localLastSaveOK=false;
async function saveLocalPending(){
 localLastSaveOK=false;if(!data||!localReady)return false;if(localConflict){showLocalConflict();return false;}if(!dirty)return true;
 $('#saveBtn').disabled=true;
 try{for(let attempt=0;attempt<3;attempt++){
  const snapshot=copyState(data),text=JSON.stringify(snapshot);if(new TextEncoder().encode(text).length>1000000)throw Error('여행 백업은 1MB 이내로 보관해 주세요.');if(!validState(snapshot))throw Error('여행 데이터 형식을 확인해 주세요.');
  const result=await commitRidebookRecord(snapshot,localRevision);
  if(!result.ok){const remote=result.record?.data||null,m=mergeTravelState(localBase,data,remote);if(m.conflicts.length){localConflict={base:localBase,remote,revision:result.record?.revision||0};showLocalConflict();return false;}data=m.state;localBase=copyState(remote);localRevision=result.record?.revision||0;rememberLocalDraft();continue;}
  localBase=snapshot;localRevision=result.record.revision;dirty=JSON.stringify(data)!==text;localLastSaveOK=true;$('#saveState').textContent=dirty?'기기에 저장 중':'기기 저장 완료';$('#syncNotice').hidden=true;
  if(dirty)rememberLocalDraft();else try{localStorage.removeItem(draftKey);}catch{}return true;
 }throw Error('다른 창의 저장이 진행 중입니다. 잠시 후 다시 저장해 주세요.');}
 catch(e){rememberLocalDraft();$('#saveState').textContent='저장 재시도';localMessage(e.message);return false;}
 finally{$('#saveBtn').disabled=false;}
}
$('#saveBtn').onclick=save;$('#keepLocal').onclick=()=>chooseLocalConflict('local');$('#keepRemote').onclick=()=>chooseLocalConflict('remote');$('#closeSyncConflict').onclick=()=>$('#syncConflictDialog').close();
$('#importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('1MB 이하의 백업 파일을 선택하세요.');const incoming=JSON.parse(await file.text());if(!validState(incoming))throw Error('여행 백업 형식이 아닙니다.');if(data&&!confirm('현재 여행을 바꿉니다. 필요한 내용은 백업했나요?'))return;await importLocalState(incoming);notify('기기에 가져왔습니다.');}catch(error){localMessage(error.message);}finally{e.target.value='';}};
window.addEventListener('pagehide',()=>{if(dirty)rememberLocalDraft();});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&dirty){rememberLocalDraft();save();}});
function installationHelp(){const installed=window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone;$('#appToolsBody').innerHTML=`<p>${installed?'홈 화면 앱으로 실행 중입니다.':'웹에서도 사용할 수 있고 홈 화면에 앱으로 추가할 수 있습니다.'}</p><p>iPhone: Safari 공유 → 홈 화면에 추가<br>Android: 브라우저 메뉴 → 앱 설치</p><p>여행은 이 기기에 저장됩니다. 다른 기기에는 백업 파일을 가져오세요. 기기 간 자동 동기화는 사용하지 않습니다.</p><p>브라우저 데이터를 삭제하기 전에는 백업을 보관하세요.</p><div class="actions"><button id="toolsExport">여행 백업</button><button id="toolsImport">백업 가져오기</button>${installPrompt?'<button id="promptInstall" class="primary">앱 설치</button>':''}${pwaWaiting?'<button id="applyAppUpdate">새 버전 적용</button>':''}</div>`;$('#toolsExport').onclick=()=>$('#exportBtn').click();$('#toolsImport').onclick=()=>{$('#appTools').close();$('#importFile').click();};if(installPrompt)$('#promptInstall').onclick=async()=>{await installPrompt.prompt();installPrompt=null;};if(pwaWaiting)$('#applyAppUpdate').onclick=async()=>{if(dirty){await save();if(dirty){notify('저장을 마친 뒤 새 버전을 적용해 주세요.');return;}}sessionStorage.setItem('ridebook-update','1');pwaWaiting.postMessage({type:'ACTIVATE'});};$('#appTools').showModal();}
$('#installApp').onclick=installationHelp;$('#closeAppTools').onclick=()=>$('#appTools').close();window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
if('serviceWorker' in navigator){navigator.serviceWorker.register('/ridebook/sw.js',{scope:'/ridebook/',updateViaCache:'none'}).then(async reg=>{
 const showWaiting=()=>{if(reg.waiting){pwaWaiting=reg.waiting;$('#offlineStatus').textContent='새 버전 있음 · 앱 메뉴에서 적용';}};showWaiting();reg.addEventListener('updatefound',()=>{reg.installing?.addEventListener('statechange',showWaiting);});
 await navigator.serviceWorker.ready;$('#offlineStatus').textContent='오프라인 준비 완료';showWaiting();navigator.storage?.persist?.().catch(()=>{});
 }).catch(()=>{$('#offlineStatus').textContent='오프라인 준비 실패 · 온라인에서 다시 열기';});navigator.serviceWorker.addEventListener('controllerchange',()=>{if(sessionStorage.getItem('ridebook-update')){sessionStorage.removeItem('ridebook-update');location.reload();}});}
else $('#offlineStatus').textContent='이 브라우저는 온라인으로 사용하세요';
const localMore=openMore;openMore=function(){localMore();$('#moreBody').insertAdjacentHTML('beforeend','<button id="localAppSettings">설치 · 기기 저장 안내</button>');$('#localAppSettings').onclick=()=>{$('#moreDialog').close();installationHelp();};};$('#moreBtn').onclick=openMore;
const localNotes=views.notes;views.notes=()=>localNotes().replace('논의할 내용과 참고 자료를 모아 둡니다.','메모와 참고 자료 · 이 기기에 자동 저장').replace('입력한 내용은 자동 저장됩니다. 동기화 상태는 상단에서 확인하세요.','입력한 내용은 이 기기에 자동 저장됩니다.').replace('Chrome 또는 Safari에서 로그인 후 공유 메뉴의 ‘홈 화면에 추가’를 선택하세요. 인터넷 연결과 본인 계정 로그인이 필요합니다.','공유 메뉴의 ‘홈 화면에 추가’를 선택하세요. 오프라인 준비 완료 후에는 인터넷 없이 여행 정보를 확인할 수 있습니다.').replace('다른 기기에서는 같은 주소로 접속하세요.','다른 기기에서는 같은 주소를 열고 백업 파일을 가져오세요.');
