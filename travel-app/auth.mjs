// Fail closed even on the Pages preview hostname without an Access policy.
let cached;
const decode=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const parse=s=>JSON.parse(new TextDecoder().decode(decode(s)));
export function configuration(env){
 const team=env.TRAVEL_ACCESS_TEAM;
 if(typeof team!=='string'||!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(team)||!env.TRAVEL_ACCESS_AUD||!env.TRAVEL_OWNER_EMAIL||!env.TRAVEL_STORE)return null;
 return {team,aud:env.TRAVEL_ACCESS_AUD,email:env.TRAVEL_OWNER_EMAIL.trim().toLowerCase()};
}
export async function authorize(request,config,fetcher=fetch){
 try{
  const token=request.headers.get('Cf-Access-Jwt-Assertion');if(!token||token.length>16384)return false;
  const parts=token.split('.');if(parts.length!==3)return false;
  const h=parse(parts[0]),p=parse(parts[1]),now=Date.now()/1000;
  if(h.alg!=='RS256'||typeof h.kid!=='string'||p.iss!==config.team||!Array.isArray(p.aud)||!p.aud.includes(config.aud)||typeof p.exp!=='number'||p.exp<=now||typeof p.iat!=='number'||p.iat>now+60||(p.nbf!==undefined&&(typeof p.nbf!=='number'||p.nbf>now))||typeof p.email!=='string'||p.email.toLowerCase()!==config.email)return false;
  if(!cached||cached.team!==config.team||cached.until<Date.now()||!cached.keys.some(k=>k.kid===h.kid)){
   const r=await fetcher(config.team+'/cdn-cgi/access/certs',{redirect:'manual',signal:AbortSignal.timeout(5000)});if(!r.ok)return false;
   const body=await r.json();if(!Array.isArray(body.keys))return false;cached={team:config.team,until:Date.now()+300000,keys:body.keys};
  }
  const jwk=cached.keys.find(k=>k.kid===h.kid&&k.kty==='RSA');if(!jwk)return false;
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  return await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
 }catch{return false;}
}
