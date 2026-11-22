export const courseCategories=['리커버리','평지 중장거리','산악 중장거리'];
export function courseMetric(v){if(v==null||String(v).trim()==='')return null;const n=Number(String(v).replace(/,/g,''));return Number.isFinite(n)&&n>=0?n:null;}
export function courseCategory(r){
 if([...courseCategories,'분류 대기'].includes(r.category))return r.category;
 return suggestCourseCategory(r).category;
}
function suggestCourseCategory(r){
 const name=String(r.name||'');
 if(/samoeng|mini\s*xl|싸몽|쌈몽|도이\s*수텝|도이\s*뿌이|doi\s*suthep|doi\s*pui|chae?\s*son/i.test(name))return {category:'산악 중장거리'};
 if(/easy ride|recovery|리커버리|회복/i.test(name))return {category:'리커버리'};
 if(r.type==='실제 주행'){
  if(/rose\s*garden/i.test(name))return {category:'산악 중장거리',reason:'코스명에 나온 로즈가든의 산악 접근로를 기준으로 임시 분류했습니다. 실제 주행 경로·고도는 확인이 필요합니다.'};
  if(/\b55\s*(?:cycling|club)\b|khun\s*bee/i.test(name))return {category:'평지 중장거리',reason:'같은 이름의 일반적인 평지·완만한 구릉 코스를 기준으로 임시 분류했습니다. 실제 주행 경로·고도는 확인이 필요합니다.'};
  return {category:'평지 중장거리',reason:'주행 기록을 목록에서 바로 찾을 수 있도록 평지에 임시 배치했습니다. 지형이 확인된 것은 아니며, 실제 경로·고도 확인 후 카테고리를 바꿀 수 있습니다.'};
 }
 return {category:'분류 대기'};
}
export function courseCategoryNote(r){
 if(r.categorySuggestion&&r.categorySuggestion.category===r.category)return r.categorySuggestion.reason||'';
 return r.category?'':suggestCourseCategory(r).reason||'';
}
export function normalizeCourses(state){
 if(state.courseRevision==='compact-v2')return false;
 const firstMigration=state.courseRevision!=='compact-v1';
 for(const r of state.routes){
  if(firstMigration&&/^https:\/\/(?:www\.)?strava\.com\/routes\/7630897\/?(?:[?#].*)?$/.test(r.url||'')){if(courseMetric(r.distance)===null)r.distance='86.7';if(courseMetric(r.elevation)===null)r.elevation='1782';}
  if(!r.category||(r.type==='실제 주행'&&r.category==='분류 대기')){
   const suggestion=suggestCourseCategory(r);r.category=suggestion.category;
   if(suggestion.reason)r.categorySuggestion=suggestion;else delete r.categorySuggestion;
  }
  if(firstMigration&&/^\d{4} 계획$/.test(r.year||'')){r.sourceLabel=r.sourceLabel||r.year;r.year='';}
 }
 state.courseRevision='compact-v2';return true;
}

// Guide distances describe the linked route, not an exact ride from the user's hotel.
export const recoveryCourses=[
 {id:'guide_recovery_lake',name:'후아이퉁타오 호수 왕복',type:'추천 후보',category:'리커버리',distance:'34',elevation:'',elevationLabel:'<100',url:'https://gobackpackgo.com/huay-tung-tao-cycling/',metricSource:'공개 가이드의 수텝 로드 출발 경로 기준',note:'가볍게 호수 한 바퀴를 돌고 돌아오는 평지 코스. 참고 경로는 34km, 획득고도 100m 미만이며 숙소 출발점에 따라 달라집니다. 기록 경쟁 없이 혼자 편하게 타는 날에 선택하세요. 원문에서 GPX를 받을 수 있습니다.',guideRoute:true},
 {id:'guide_recovery_river',name:'핑강 북쪽 루프',type:'추천 후보',category:'리커버리',distance:'',distanceLabel:'55–75',elevation:'55',url:'https://chiangmaicyclist.wordpress.com/2023/11/06/ride-of-the-week-northern-river-loop/',metricSource:'공개 가이드 제시 범위 · 우회·출발점에 따라 변동',note:'핑강과 작은 수로를 따라 마을·논 사이를 도는 평지 소셜 코스. 55–75km, 획득고도 약 55m는 원문 가이드 기준입니다. 짧게 돌아오는 갈림길을 선택할 수 있습니다. 요철·부분 비포장 구간은 원문과 GPX에서 확인하세요. Jeff’s Northern Loop 기록과 동일한 경로라고 단정하지 않습니다.',guideRoute:true}
];
export function addRecoveryCourses(state){
 if(state.recoveryGuideRevision==='v1')return false;
 for(const route of recoveryCourses)if(!state.routes.some(r=>r.id===route.id||r.url===route.url))state.routes.push({...route});
 state.recoveryGuideRevision='v1';return true;
}
export function courseDisplayMetric(r,key){return courseMetric(r[key])!==null?courseMetric(r[key]).toLocaleString('en-US',{maximumFractionDigits:1}):String(r[key+'Label']||'—');}
