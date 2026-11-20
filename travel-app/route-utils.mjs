export function routeIdentity(url){
 try{const u=new URL(url);if(u.protocol!=='https:'||!['strava.com','www.strava.com'].includes(u.hostname))return null;const m=u.pathname.match(/^\/(routes|activities)\/(\d+)\/?$/);return m?{type:m[1]==='routes'?'route':'activity',id:m[2]}:null;}catch{return null;}
}
export function seatNumber(f){
 const explicit=f.seat||f.seatNumber||f.seat_number;if(explicit)return String(explicit);
 return String(f.note||'').match(/(?:좌석(?:번호)?|seat)\s*[:：-]?\s*(\d{1,3}\s?[A-K])\b/i)?.[1]?.replace(/\s/g,'').toUpperCase()||'';
}
export function normalizeFlights(state){
 if(state.flightRevision==='morning-calm-2026-11-20')return false;
 let updated=false;
 for(const f of state.flights){
  if(!/대한항공|\bKE\s*\d/i.test(f.name||''))continue;
  if(f.baggagePieces==null){f.baggagePieces=2;updated=true;}
  if(!f.membership){f.membership='모닝캄';updated=true;}
  const seat=seatNumber(f);if(!f.seat&&seat){f.seat=seat;updated=true;}
  const clean=String(f.note||'').replace(/무료\s*수하물\s*1개[.。]?\s*/g,'').replace(/좌석번호·중량·자전거 조건은 추가 확인\.?/g,'').replace(/좌석번호만 추가하면 됩니다\.?/g,'').replace(/좌석 예약 완료 \(본인 확인\)\s*·?\s*/g,'').replace(/·\s*(?=\n|$)/g,'').trim();
  if(clean!==f.note){f.note=clean;updated=true;}
 }
 state.flightRevision='morning-calm-2026-11-20';return true;
}
export function analyzeTrack(segments){
 if(!Array.isArray(segments)||!segments.length)throw Error('경로 좌표가 없습니다.');
 const valid=segments.filter(s=>Array.isArray(s)&&s.length>=2);if(valid.length>50)throw Error('경로 구간이 너무 많습니다. 하나의 코스 파일을 선택하세요.');let total=0,gain=0,elevationCount=0,pointCount=0,min=Infinity,max=-Infinity;const profile=[],geometry=[];
 const distance=(a,b)=>{const rad=Math.PI/180;const lat=(b[0]-a[0])*rad,lon=(b[1]-a[1])*rad;const h=Math.sin(lat/2)**2+Math.cos(a[0]*rad)*Math.cos(b[0]*rad)*Math.sin(lon/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));};
 const totalPoints=valid.reduce((n,s)=>n+s.length,0);if(totalPoints<2||totalPoints>150000)throw Error('경로 좌표 수를 확인해 주세요.');
 for(const segment of valid){let prev=null;const sample=[],step=Math.max(1,Math.ceil(segment.length/Math.max(2,Math.floor(1000*segment.length/totalPoints))));
  for(let i=0;i<segment.length;i++){const p=segment[i];if(!Array.isArray(p)||!Number.isFinite(p[0])||!Number.isFinite(p[1])||Math.abs(p[0])>90||Math.abs(p[1])>180)throw Error('올바르지 않은 경로 좌표입니다.');
   if(prev)total+=distance(prev,p);pointCount++;if(Number.isFinite(p[2])){elevationCount++;min=Math.min(min,p[2]);max=Math.max(max,p[2]);if(prev&&Number.isFinite(prev[2]))gain+=Math.max(0,p[2]-prev[2]);profile.push([Math.round(total)/1000,Math.round(p[2])]);}
   if(i%step===0||i===segment.length-1)sample.push([+p[0].toFixed(6),+p[1].toFixed(6)]);prev=p;
  }geometry.push(sample);
 }
 const profileStep=Math.max(1,Math.ceil(profile.length/350));return {distance:(total/1000).toFixed(1),elevation:elevationCount===pointCount?String(Math.round(gain)):'',minElevation:elevationCount?Math.round(min):null,maxElevation:elevationCount?Math.round(max):null,geometry,profile:profile.filter((_,i)=>i%profileStep===0||i===profile.length-1),elevationComplete:elevationCount===pointCount};
}
export function parseGpx(text){
 if(text.length>12000000||/<!DOCTYPE|<!ENTITY/i.test(text))throw Error('지원하지 않는 GPX 파일입니다.');
 const xml=new DOMParser().parseFromString(text,'application/xml');if(xml.getElementsByTagName('parsererror').length||xml.documentElement.localName!=='gpx')throw Error('올바른 GPX 파일을 선택하세요.');
 const by=(node,name)=>Array.from(node.getElementsByTagNameNS('*',name));
 const point=p=>{const lat=p.getAttribute('lat'),lon=p.getAttribute('lon'),ele=by(p,'ele')[0]?.textContent?.trim();return [lat===null||!lat.trim()?NaN:Number(lat),lon===null||!lon.trim()?NaN:Number(lon),ele?Number(ele):null];};
 let segments=by(xml,'trkseg').map(s=>by(s,'trkpt').map(point));if(!segments.length)segments=by(xml,'rte').map(s=>by(s,'rtept').map(point));
 const result=analyzeTrack(segments);return {...result,metricSource:'GPX 계산값',importedAt:new Date().toISOString()};
}
