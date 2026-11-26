// User-initiated, same-origin handoff. Never publishes private data in the app shell.
function transferToRidebook(){
 if(!data||!validState(data)){notify('먼저 기존 여행을 불러와 주세요.');return;}
 if(syncConflict){notify('변경 내용 비교를 마친 뒤 옮겨 주세요.');return;}
 try{localStorage.setItem('ridebook-transfer-v1',JSON.stringify({data,at:new Date().toISOString()}));location.assign('/ridebook/');}
 catch{notify('직접 옮기지 못했습니다. 데이터 백업 후 새 앱에서 가져와 주세요.');}
}
const transferMore=openMore;openMore=function(){transferMore();$('#moreBody').insertAdjacentHTML('beforeend','<div class="more-tools"><button id="transferApp">로그인 없는 앱으로 옮기기</button></div><p class="section-intro">이 기기에 복사합니다. 이후 앱의 수정은 기존 서버와 자동 동기화되지 않습니다.</p>');$('#transferApp').onclick=transferToRidebook;};$('#moreBtn').onclick=openMore;
const transferLoad=load;load=async function(){await transferLoad();if(location.hash==='#app-transfer'&&data&&!syncConflict){$('#syncNotice').hidden=false;$('#syncNotice').innerHTML='<div><strong>현재 여행을 앱으로 복사</strong><p>일정·코스·예약·메모를 이 기기로 옮깁니다. 이후 앱의 수정은 기존 서버와 자동 동기화되지 않습니다.</p></div><div class="actions"><button id="confirmTransfer">앱으로 옮기기</button></div>';$('#confirmTransfer').onclick=transferToRidebook;}};
