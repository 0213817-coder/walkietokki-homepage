const feedCacheKey='ridebook-public-discoveries-v1';let feedRefreshing=false,feedFetchedAt=0,feedStatus='기본 추천';
function installDiscoveryFeed(feed){const merged=mergeDiscoveryFeed(discoveries,feed);discoveries.splice(0,discoveries.length,...merged);discoveryChecked=feed.checkedAt;}
try{const cached=JSON.parse(localStorage.getItem(feedCacheKey)||'null');if(cached&&validDiscoveryFeed(cached.feed)){installDiscoveryFeed(cached.feed);feedFetchedAt=Number(cached.fetchedAt)||0;feedStatus='저장된 추천';}}catch{}
async function refreshDiscoveryFeed(force=false){
 if(typeof navigator==='undefined'||feedRefreshing||!navigator.onLine||(!force&&Date.now()-feedFetchedAt<12*3600000))return;feedRefreshing=true;const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),5000);
 try{const res=await fetch('/ridebook/discoveries.json',{cache:'no-store',credentials:'omit',signal:controller.signal});if(!res.ok)throw Error();const text=await res.text();if(text.length>200000)throw Error();const feed=JSON.parse(text);if(feed.checkedAt<discoveryChecked)throw Error();installDiscoveryFeed(feed);feedFetchedAt=Date.now();feedStatus='최신 자료 확인';try{localStorage.setItem(feedCacheKey,JSON.stringify({feed,fetchedAt:feedFetchedAt}));}catch{}if(data&&view==='discover')render();}
 catch{feedStatus='저장된 추천 · 연결 후 재확인';}
 finally{clearTimeout(timeout);feedRefreshing=false;}
}
const dailyDiscover=views.discover;views.discover=()=>dailyDiscover().replace('<div class="discovery-filter"',`<p class="section-intro">${esc(feedStatus)} · 자료 갱신 ${esc(discoveryChecked)} <button id="refreshDiscoveries">새로 확인</button></p><div class="discovery-filter"`);
const dailyBind=bind;bind=function(){dailyBind();const b=$('#refreshDiscoveries');if(b)b.onclick=async()=>{b.disabled=true;await refreshDiscoveryFeed(true);if(data)render();};};
window.addEventListener('online',()=>refreshDiscoveryFeed());document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshDiscoveryFeed();});refreshDiscoveryFeed();
