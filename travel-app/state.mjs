const collections=['flights','hotels','places','routes','days','packing'];
export function validState(x){
 if(!x||typeof x!=='object'||!x.trip||typeof x.trip!=='object'||typeof x.notes!=='string'||!Array.isArray(x.sources)||x.sources.some(s=>!s||typeof s.name!=='string'||typeof s.url!=='string'))return false;
 for(const k of collections){
  if(!Array.isArray(x[k])||x[k].length>2000)return false;
  const ids=new Set();for(const item of x[k]){if(!item||typeof item.id!=='string'||!/^[a-zA-Z0-9_-]+$/.test(item.id)||ids.has(item.id))return false;ids.add(item.id);}
 }
 if(!x.days.length||x.days.some(d=>typeof d.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||Number.isNaN(Date.parse(d.date))))return false;
 for(const f of x.flights){if(f.baggagePieces!==undefined&&f.baggagePieces!==''&&(!/^\d{1,2}$/.test(String(f.baggagePieces))||Number(f.baggagePieces)>20))return false;}
 for(const r of x.routes){
  if(r.geometry!==undefined&&(!Array.isArray(r.geometry)||r.geometry.length>50||r.geometry.some(s=>!Array.isArray(s)||s.length>1200||s.some(p=>!Array.isArray(p)||p.length!==2||!Number.isFinite(p[0])||!Number.isFinite(p[1])||Math.abs(p[0])>90||Math.abs(p[1])>180))||r.geometry.reduce((n,s)=>n+s.length,0)>1200))return false;
  if(r.profile!==undefined&&(!Array.isArray(r.profile)||r.profile.length>400||r.profile.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isFinite(n)))))return false;
 }
 if(x.discoveryLog!==undefined&&(!x.discoveryLog||typeof x.discoveryLog!=='object'||Array.isArray(x.discoveryLog)||Object.entries(x.discoveryLog).some(([id,item])=>!(/^[a-zA-Z0-9_-]{1,80}$/).test(id)||!item||typeof item!=='object'||Array.isArray(item)||Object.entries(item).some(([key,val])=>!['saved','visited','known'].includes(key)||typeof val!=='boolean'))))return false;
 if(x.days.some(d=>d.experienceIds!==undefined&&(!Array.isArray(d.experienceIds)||d.experienceIds.length>100||new Set(d.experienceIds).size!==d.experienceIds.length||d.experienceIds.some(id=>typeof id!=='string'||!(/^[a-zA-Z0-9_-]{1,80}$/).test(id)))))return false;
 if(x.preparation!==undefined&&(!Array.isArray(x.preparation)||x.preparation.some(p=>!p||typeof p.title!=='string'||typeof p.body!=='string')))return false;
 if(x.chargingItems!==undefined&&(!Array.isArray(x.chargingItems)||x.chargingItems.some(i=>typeof i!=='string')))return false;
 if(x.chargeLog!==undefined&&(!x.chargeLog||typeof x.chargeLog!=='object'||Array.isArray(x.chargeLog)||Object.entries(x.chargeLog).some(([day,items])=>!/^\d{4}-\d{2}-\d{2}$/.test(day)||!items||typeof items!=='object'||Object.entries(items).some(([key,val])=>!/^\d+$/.test(key)||typeof val!=='boolean'))))return false;
 return true;
}
export async function readLimited(request,limit=1000000){
 if(Number(request.headers.get('Content-Length'))>limit)throw new RangeError();
 if(!request.body)return '';
 const reader=request.body.getReader(),chunks=[];let size=0;
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new RangeError();}chunks.push(value);}
 const combined=new Uint8Array(size);let offset=0;for(const v of chunks){combined.set(v,offset);offset+=v.byteLength;}return new TextDecoder().decode(combined);
}
