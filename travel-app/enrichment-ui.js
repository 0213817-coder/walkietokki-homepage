const importWithEnrichment=$('#importFile').onchange;
$('#importFile').onchange=async e=>{
 const file=e.target.files[0];if(!file)return;
 let incoming;try{if(file.size>1000000)throw Error('1MB 이하의 파일을 선택하세요.');incoming=JSON.parse(await file.text());}catch(err){notify(err.message);e.target.value='';return;}
 if(incoming.kind!=='travel-enrichment')return importWithEnrichment(e);
 try{
  if(!data)throw Error('먼저 기존 여행 백업을 가져온 뒤 확인 자료를 적용하세요.');
  const result=applyTravelEnrichment(data,incoming,validState);
  if(!confirm(`기존 코스 확인 ${result.routes}개 · 새 코스 ${result.addedRoutes}개 · 방문 장소 ${result.places}개 · 일정 확인 ${result.days||0}개${incoming.stay?' · 숙박 확정':''}를 반영합니다. 기존 일정·메모·즐겨찾기는 유지합니다.${result.skipped.length?' 이미 있거나 이름이 바뀐 항목 '+result.skipped.length+'개는 제외합니다.':''}`))return;
  localStorage.setItem('ridebook-before-enrichment-v1',JSON.stringify(data));
  data=result.state;changed();render();await save();notify('확인 자료를 반영했습니다. 저장 상태를 확인하세요.');
 }catch(err){notify(err.message);}finally{e.target.value='';}
};
const enrichedMore=openMore;openMore=function(){enrichedMore();$('#moreBody').insertAdjacentHTML('beforeend','<button id="importVerified">코스·숙박 확인 자료 반영</button><button id="exportBeforeVerified">반영 전 백업 내려받기</button>');$('#importVerified').onclick=()=>{$('#moreDialog').close();$('#importFile').click();};$('#exportBeforeVerified').onclick=()=>{const text=localStorage.getItem('ridebook-before-enrichment-v1');if(!text){notify('보관된 반영 전 백업이 없습니다.');return;}const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='travel-before-update.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};};$('#moreBtn').onclick=openMore;
