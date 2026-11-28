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

// Enrichment is deliberately additive: never replace a user's whole trip.
export function applyTravelEnrichment(state,p,validate){
 if(!p||p.kind!=='travel-enrichment'||typeof p.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(p.id)||!Array.isArray(p.routes)||p.routes.length>100||!Array.isArray(p.places)||p.places.length>100||p.addRoutes!==undefined&&(!Array.isArray(p.addRoutes)||p.addRoutes.length>30)||p.dayNotes!==undefined&&(!Array.isArray(p.dayNotes)||p.dayNotes.length>31))throw Error('확인 자료의 형식이 올바르지 않습니다.');
 const next=JSON.parse(JSON.stringify(state)),seen=new Set(),skipped=[];let routes=0,addedRoutes=0,places=0,days=0;
 for(const u of p.routes){
  if(!u||seen.has(u.id)||!/^https:\/\/www\.strava\.com\/(activities|routes)\/\d+$/.test(u.url||''))throw Error('중복되거나 잘못된 코스 자료입니다.');seen.add(u.id);
  const r=next.routes.find(r=>r.id===u.id&&r.name===u.expectedName&&String(r.year||'')===String(u.expectedYear||''));if(!r){skipped.push(u.expectedName||u.id);continue;}
  for(const key of ['distance','elevation'])if(typeof u[key]!=='string'||!/^\d+(\.\d+)?$/.test(u[key]))throw Error('거리·고도 자료를 확인해 주세요.');
  if(!['리커버리','평지 중장거리','산악 중장거리'].includes(u.category)||typeof u.verifiedNote!=='string'||u.verifiedNote.length>2000)throw Error('코스 분류 자료를 확인해 주세요.');
  for(const key of ['url','distance','elevation','geometry','profile','metricSource','gpxFileName','gpxSha256','verifiedAt'])if(u[key]!==undefined)r[key]=u[key];
  if(!r.category||r.category==='분류 대기'||r.categorySuggestion){r.category=u.category;delete r.categorySuggestion;}
  if(/^스트라바 훈련 로그에서/.test(r.note||'')){r.originalImportNote=r.note;r.note=u.verifiedNote;}
  else if(!String(r.note||'').includes(u.verifiedNote))r.note=[r.note,u.verifiedNote].filter(Boolean).join('\n');
  routes++;
 }
 for(const u of p.addRoutes||[]){
  if(!u||seen.has(u.id)||!/^public_[a-zA-Z0-9_-]{1,72}$/.test(u.id||'')||!/^https:\/\/www\.strava\.com\/routes\/\d+$/.test(u.url||'')||!/^https:\/\//.test(u.sourceUrl||''))throw Error('추가 코스의 출처 또는 식별자를 확인해 주세요.');seen.add(u.id);
  if(next.routes.some(r=>r.id===u.id||r.url===u.url)){skipped.push(u.name||u.id);continue;}
  for(const key of ['name','distance','elevation','metricSource','gpxFileName','gpxSha256','verifiedAt','verifiedNote'])if(typeof u[key]!=='string'||!u[key].trim())throw Error('추가 코스의 확인 자료를 확인해 주세요.');
  if(!/^\d+(\.\d+)?$/.test(u.distance)||!/^\d+(\.\d+)?$/.test(u.elevation)||!['리커버리','평지 중장거리','산악 중장거리'].includes(u.category)||!/^[a-f0-9]{64}$/.test(u.gpxSha256)||!/^\d{4}-\d{2}-\d{2}$/.test(u.verifiedAt)||u.verifiedNote.length>2000)throw Error('추가 코스의 거리·고도·분류 자료를 확인해 주세요.');
  const route={id:u.id,name:u.name,type:'공식 코스',year:'',url:u.url,distance:u.distance,elevation:u.elevation,category:u.category,geometry:u.geometry,profile:u.profile,metricSource:u.metricSource,gpxFileName:u.gpxFileName,gpxSha256:u.gpxSha256,verifiedAt:u.verifiedAt,note:u.verifiedNote,sourceUrl:u.sourceUrl,sourceLabel:u.sourceLabel||'공식 공개 코스',favorite:false};
  next.routes.push(route);addedRoutes++;
 }
 for(const u of p.places){const place=next.places.find(x=>x.id===u.id&&x.name===u.expectedName);if(!place){skipped.push(u.expectedName||u.id);continue;}if(u.visited!==true||typeof u.visitEvidence!=='string'||u.visitEvidence.length>2000||!/^\d{4}-\d{2}-\d{2}$/.test(u.visitDate||''))throw Error('방문 확인 자료를 확인해 주세요.');place.visited=true;place.visitEvidence=u.visitEvidence;place.visitDate=u.visitDate;if(!String(place.note||'').includes(u.visitEvidence))place.note=[place.note,u.visitEvidence].filter(Boolean).join('\n');places++;}
 for(const u of p.dayNotes||[]){
  if(!u||typeof u.id!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(u.expectedDate||'')||typeof u.expectedRouteId!=='string'||typeof u.verifiedNote!=='string'||!u.verifiedNote.trim()||u.verifiedNote.length>2000||!/^https:\/\//.test(u.sourceUrl||'')||!/^\d{4}-\d{2}-\d{2}$/.test(u.checkedAt||''))throw Error('일정 확인 자료를 확인해 주세요.');
  const day=next.days.find(x=>x.id===u.id&&x.date===u.expectedDate&&x.routeId===u.expectedRouteId);if(!day){skipped.push(u.expectedDate);continue;}
  if(!String(day.note||'').includes(u.verifiedNote)){day.note=[day.note,u.verifiedNote].filter(Boolean).join('\n');days++;}
 }
 if(p.stay)applyStayUpdate(next,p.stay);
 next.lastVerifiedUpdate={id:p.id,routes,addedRoutes,places,days};
 if(!validate(next)||new TextEncoder().encode(JSON.stringify(next)).length>1000000)throw Error('업데이트 용량 또는 형식을 확인해 주세요. 기존 데이터는 유지됩니다.');
 return {state:next,routes,addedRoutes,places,days,skipped};
}
