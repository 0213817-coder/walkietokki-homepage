import { configuration, authorize } from '../../travel-app/auth.mjs';
import { validState, readLimited } from '../../travel-app/state.mjs';
import { HTML } from '../../travel-app/ui.mjs';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow','Vary':'Cf-Access-Jwt-Assertion, Cookie'};
const json=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{...headers,'Content-Type':'application/json; charset=utf-8',...extra}});
// This is an application revision, not a compressed HTTP representation validator.
// Accept a single legacy ETag (including the CDN's W/ prefix) but never wildcards/lists.
function revision(value){const match=/^(?:W\/)?"([A-Za-z0-9_-]{1,128})"$/.exec(value||'');return match?.[1]||null;}
function versionHeaders(object){const value=object?.httpEtag||'"initial"';return {ETag:value,'X-Travel-Version':value};}
export async function onRequest({request,env}){
 const config=configuration(env);
 if(!config)return new Response('비공개 여행 공간 설정 중입니다.',{status:503,headers});
 if(!await authorize(request,config))return json({error:'다시 로그인한 뒤 저장을 재시도하세요.',code:'AUTH'},401);
 const url=new URL(request.url);
 try{
  if(url.pathname==='/travel/api/state'){
   if(request.method==='GET'){
    const obj=await env.TRAVEL_STORE.get('travel/state.json');
    return json(obj?await obj.json():{needsSetup:true},200,versionHeaders(obj));
   }
   if(request.method==='PUT'){
    if(request.headers.get('Origin')!==url.origin)return json({error:'허용되지 않은 요청입니다.'},403);
    const supplied=request.headers.get('X-Travel-Version')??request.headers.get('If-Match');if(!supplied)return json({error:'버전 정보가 없습니다.'},428);
    const etag=revision(supplied);if(!etag)return json({error:'저장 버전 형식이 올바르지 않습니다. 페이지를 새로고침해 주세요.'},400);
    let state;try{state=JSON.parse(await readLimited(request));}catch(e){return json({error:'파일 크기 또는 형식을 확인하세요.'},e instanceof RangeError?413:400);}
    if(!validState(state))return json({error:'여행 백업 형식을 확인하세요.'},400);
    const result=await env.TRAVEL_STORE.put('travel/state.json',JSON.stringify(state),{onlyIf:etag==='initial'?{etagDoesNotMatch:'*'}:{etagMatches:etag},httpMetadata:{contentType:'application/json'}});
    if(!result)return json({error:'다른 기기에서 변경되었습니다. 최신 내용과 비교해 주세요.'},409);
    return json({ok:true},200,versionHeaders(result));
   }
   return json({error:'지원하지 않는 요청'},405,{Allow:'GET, PUT'});
  }
  if((url.pathname==='/travel'||url.pathname==='/travel/')&&request.method==='GET')return new Response(HTML,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline' https://cdn.jsdelivr.net; font-src https://cdn.jsdelivr.net; img-src 'self' https: data:; manifest-src 'self'; frame-src https://www.google.com https://maps.google.com https://strava-embeds.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"}});
  return new Response('Not found',{status:404,headers});
 }catch{return json({error:'저장 공간 연결을 확인해 주세요.'},503);}
}
