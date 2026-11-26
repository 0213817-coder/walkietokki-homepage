export function validDiscoveryFeed(feed){
 const date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x));
 if(!feed||feed.version!==1||!date(feed.checkedAt)||!Array.isArray(feed.items)||!feed.items.length||feed.items.length>80)return false;
 const ids=new Set(),required=['name','place','area','theme','duration','description','hours','caution','query','url','checkedAt'];
 const strings=[...required,'fresh','image','startsOn','endsOn','sourceLabel'];
 for(const x of feed.items){
  if(!x||typeof x.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(x.id)||ids.has(x.id)||required.some(k=>typeof x[k]!=='string'||!x[k].trim())||strings.some(k=>x[k]!==undefined&&(typeof x[k]!=='string'||x[k].length>2000)))return false;ids.add(x.id);
  if(!date(x.checkedAt)||x.checkedAt>feed.checkedAt||['startsOn','endsOn'].some(k=>x[k]!==undefined&&!date(x[k]))||(x.startsOn&&x.endsOn&&x.startsOn>x.endsOn))return false;
  for(const key of ['url','image'])if(x[key]){try{const u=new URL(x[key]);if(u.protocol!=='https:'||u.username||u.password)return false;}catch{return false;}}
  if(!['tram','market','stories','craft','art','coffee'].includes(x.icon)||!['easy','outing'].includes(x.effort)||!['morning','afternoon','evening'].includes(x.period)||!Number.isFinite(x.minutes)||x.minutes<1||x.minutes>1440||!Number.isFinite(x.closes)||x.closes<0||x.closes>24)return false;
  for(const k of ['weekdays','closedWeekdays'])if(x[k]!==undefined&&(!Array.isArray(x[k])||x[k].length>7||x[k].some(n=>!Number.isInteger(n)||n<0||n>6)))return false;
  if(x.closedDates!==undefined&&(!Array.isArray(x.closedDates)||x.closedDates.length>366||x.closedDates.some(d=>typeof d!=='string'||!/^\d{2}-\d{2}$/.test(d))))return false;
 }
 return true;
}
export function mergeDiscoveryFeed(current,feed){
 if(!validDiscoveryFeed(feed))throw Error('추천 자료 형식을 확인하지 못했습니다.');
 // Keep previous IDs for saved plans and visit history; upsert public fields only.
 const map=new Map(current.map(x=>[x.id,x]));for(const x of feed.items)map.set(x.id,{...x});return [...map.values()];
}
