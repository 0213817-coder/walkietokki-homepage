// The private confirmation and key arrive only in the owner's URL fragment, never in public assets or requests.
let pendingStayUpdate=/^#stay=([A-Za-z0-9_-]{43})\.([A-Za-z0-9_-]{16})\.([A-Za-z0-9_-]{24,30000})$/.exec(location.hash);
if(pendingStayUpdate){view='hotels';history.replaceState(null,'','#hotels');}
async function receiveStayUpdate(){
 if(!pendingStayUpdate||!data)return false;
 const [,key,iv,ciphertext]=pendingStayUpdate;
 const patch=await decodeStayUpdate({version:1,iv,ciphertext},key);
 const changed=applyStayUpdate(data,patch);pendingStayUpdate=null;return changed;
}
const staySummary=()=>{const s=data.stayConfirmation;if(!s)return '';return `<section class="card stay-confirmed">${badge('호텔 확인 완료')}<h2>${esc(s.hotelName)}</h2><p class="stay-dates">${esc(s.checkin)} — ${esc(s.checkout)} · ${Math.round((Date.parse(s.checkout)-Date.parse(s.checkin))/86400000)}박</p><p class="stay-room">${esc(s.room)} · 동일 객실 연속 투숙</p><p>${esc(s.message)}</p><p class="map-caption">호텔 회신 · ${esc(s.confirmedAt)}</p></section>`;};
views.hotels=()=>title('숙소','숙박 확인 · 예약 내역',add('hotels'))+staySummary()+`<div class="grid two">${data.hotels.map(h=>{const s=data.stayConfirmation?.hotelIds?.includes(h.id)?data.stayConfirmation:null;return `<article class="card">${badge(s?'동일 객실 확보':'예약 정보')}<h3>${esc(h.name)}</h3><p>체크인 ${esc(h.checkin||'미정')}<br>체크아웃 ${esc(h.checkout||'미정')}</p>${s?`<p class="stay-room">${esc(s.room)}</p>`:''}<p>${esc(h.address)}</p><details><summary>예약번호</summary>${esc(h.reference)}</details>${h.note?(s?`<details class="hotel-original"><summary>예약 원본 메모</summary><p>${esc(h.note)}</p></details>`:`<p>${esc(h.note)}</p>`):''}<div class="actions">${h.address?external(map(h.address),'지도'):''}${external(h.url,'예약 원본')}${edit('hotels',h.id)}</div></article>`;}).join('')}</div>`;
