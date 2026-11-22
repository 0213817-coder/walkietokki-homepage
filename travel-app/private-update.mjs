export function applyStayUpdate(state,p){
 const date=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s));
 if(!p||p.kind!=='stay-confirmation'||typeof p.id!=='string'||p.id.length>80||!date(p.checkin)||!date(p.checkout)||p.checkout<=p.checkin||!['hotelName','room','confirmedAt','message'].every(k=>typeof p[k]==='string'&&p[k].length>0&&p[k].length<1000)||!Array.isArray(p.bookings)||!p.bookings.length||p.bookings.length>30)throw Error('숙박 확인 정보의 형식이 올바르지 않습니다.');
 if(state.stayConfirmation?.updateId===p.id)return false;
 const ids=[];
 for(const b of p.bookings){const matches=state.hotels.filter(h=>typeof b.reference==='string'&&String(h.reference||'').split(/[^A-Za-z0-9]+/).includes(b.reference)&&h.checkin===b.checkin&&h.checkout===b.checkout);if(matches.length!==1||ids.includes(matches[0].id))throw Error('현재 숙소 예약과 확인 메일의 예약번호·기간이 일치하지 않습니다. 기존 데이터는 그대로 유지했습니다.');ids.push(matches[0].id);}
 const ordered=p.bookings.slice().sort((a,b)=>a.checkin.localeCompare(b.checkin));if(ordered[0].checkin!==p.checkin||ordered.at(-1).checkout!==p.checkout||ordered.some((b,i)=>i&&ordered[i-1].checkout!==b.checkin))throw Error('연속 숙박 기간이 일치하지 않습니다.');
 state.stayConfirmation={updateId:p.id,hotelIds:ids,hotelName:p.hotelName,room:p.room,checkin:p.checkin,checkout:p.checkout,confirmedAt:p.confirmedAt,message:p.message};return true;
}
export async function decodeStayUpdate(envelope,key){
 const decode=s=>{if(typeof s!=='string'||s.length>30000||!/^[A-Za-z0-9_-]+$/.test(s))throw Error('숙박 업데이트 링크가 올바르지 않습니다.');return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));};
 if(envelope?.version!==1)throw Error('지원하지 않는 숙박 업데이트입니다.');const k=decode(key),iv=decode(envelope.iv);if(k.length!==32||iv.length!==12)throw Error('업데이트 키가 올바르지 않습니다.');
 const aes=await crypto.subtle.importKey('raw',k,'AES-GCM',false,['decrypt']);return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},aes,decode(envelope.ciphertext))));
}
