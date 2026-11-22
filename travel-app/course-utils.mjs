export const courseCategories=['리커버리','평지 중장거리','산악 중장거리'];
export function courseMetric(v){if(v==null||String(v).trim()==='')return null;const n=Number(String(v).replace(/,/g,''));return Number.isFinite(n)&&n>=0?n:null;}
export function courseCategory(r){
 if([...courseCategories,'분류 대기'].includes(r.category))return r.category;
 if(/easy ride|recovery|리커버리|회복/i.test(r.name||''))return '리커버리';
 if(/samoeng|mini xl|싸몽|쌈몽|도이수텝|도이뿌이|doi suthep|doi pui/i.test(r.name||''))return '산악 중장거리';
 return '분류 대기';
}
export function normalizeCourses(state){
 if(state.courseRevision==='compact-v1')return false;
 for(const r of state.routes){
  if(/^https:\/\/(?:www\.)?strava\.com\/routes\/7630897\/?(?:[?#].*)?$/.test(r.url||'')){if(courseMetric(r.distance)===null)r.distance='86.7';if(courseMetric(r.elevation)===null)r.elevation='1782';}
  if(!r.category)r.category=courseCategory(r);
  if(/^\d{4} 계획$/.test(r.year||'')){r.sourceLabel=r.sourceLabel||r.year;r.year='';}
 }
 state.courseRevision='compact-v1';return true;
}
