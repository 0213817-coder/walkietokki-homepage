export const copyState=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function mergeTravelState(base,local,remote,preference){
 const conflicts=[];
 const merge=(b,l,r,path)=>{
  if(equal(l,b))return copyState(r);if(equal(r,b)||equal(l,r))return copyState(l);
  if(plain(b)&&plain(l)&&plain(r)){const out={};for(const key of new Set([...Object.keys(b),...Object.keys(l),...Object.keys(r)])){if(['__proto__','constructor','prototype'].includes(key))continue;const v=merge(b[key],l[key],r[key],path.concat(key));if(v!==undefined)out[key]=v;}return out;}
  if([b,l,r].every(a=>Array.isArray(a)&&a.every(x=>plain(x)&&typeof x.id==='string')&&new Set(a.map(x=>x.id)).size===a.length)){
   const maps=[b,l,r].map(a=>new Map(a.map(x=>[x.id,x]))),ids=new Set([...r,...l,...b].map(x=>x.id)),out=[];
   for(const id of ids){const v=merge(...maps.map(m=>m.get(id)),path.concat(id));if(v!==undefined)out.push(v);}return out;
  }
  conflicts.push({path,local:copyState(l),remote:copyState(r)});return copyState(preference==='remote'?r:l);
 };
 return {state:merge(base,local,remote,[]),conflicts};
}
export async function stateResponse(response){
 const status=response.status,contentType=response.headers.get('Content-Type')||'';
 if(response.redirected||status===401||(!contentType.includes('application/json')&&status<500)){const e=Error('로그인이 만료되었습니다. 다시 로그인한 뒤 저장을 재시도하세요.');e.code='AUTH';throw e;}
 let body;try{body=await response.json();}catch{const e=Error('서버 응답을 확인하지 못했습니다. 잠시 후 다시 시도하세요.');e.code='RESPONSE';e.status=status;throw e;}
 if(!response.ok){const e=Error(body.error||'저장하지 못했습니다.');e.status=status;e.code=body.code||'HTTP';throw e;}return body;
}
