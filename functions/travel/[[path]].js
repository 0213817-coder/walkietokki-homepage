import { configuration, authorize } from '../../travel-app/auth.mjs';
import { validState, readLimited } from '../../travel-app/state.mjs';
import { HTML } from '../../travel-app/ui.mjs';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow','Vary':'Cf-Access-Jwt-Assertion, Cookie'};
const json=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{...headers,'Content-Type':'application/json; charset=utf-8',...extra}});
export async function onRequest({request,env}){
 const config=configuration(env);
 if(!config)return new Response('비공개 여행 공간 설정 중입니다.',{status:503,headers});
 if(!await authorize(request,config))return new Response('본인 계정 로그인이 필요합니다.',{status:401,headers});
 const url=new URL(request.url);
 try{
  if(url.pathname==='/travel/api/state'){
   if(request.method==='GET'){
    const obj=await env.TRAVEL_STORE.get('travel/state.json');
    return json(obj?await obj.json():{needsSetup:true},200,{ETag:obj?.httpEtag||'"initial"'});
   }
   if(request.method==='PUT'){
    if(request.headers.get('Origin')!==url.origin)return json({error:'허용되지 않은 요청입니다.'},403);
    const etag=request.headers.get('If-Match');if(!etag)return json({error:'버전 정보가 없습니다.'},428);
    let state;try{state=JSON.parse(await readLimited(request));}catch(e){return json({error:'파일 크기 또는 형식을 확인하세요.'},e instanceof RangeError?413:400);}
    if(!validState(state))return json({error:'여행 백업 형식을 확인하세요.'},400);
    const result=await env.TRAVEL_STORE.put('travel/state.json',JSON.stringify(state),{onlyIf:etag==='"initial"'?{etagDoesNotMatch:'*'}:{etagMatches:etag.replaceAll('"','')},httpMetadata:{contentType:'application/json'}});
    if(!result)return json({error:'다른 기기에서 변경했습니다. 백업 후 새로고침하세요.'},409);
    return json({ok:true},200,{ETag:result.httpEtag});
   }
   return json({error:'지원하지 않는 요청'},405,{Allow:'GET, PUT'});
  }
  if((url.pathname==='/travel'||url.pathname==='/travel/')&&request.method==='GET')return new Response(HTML,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"}});
  return new Response('Not found',{status:404,headers});
 }catch{return json({error:'저장 공간 연결을 확인해 주세요.'},503);}
}
