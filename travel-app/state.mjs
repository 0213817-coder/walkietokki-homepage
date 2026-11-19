const collections=['flights','hotels','places','routes','days','packing'];
export function validState(x){
 if(!x||typeof x!=='object'||!x.trip||typeof x.trip!=='object'||typeof x.notes!=='string'||!Array.isArray(x.sources)||x.sources.some(s=>!s||typeof s.name!=='string'||typeof s.url!=='string'))return false;
 for(const k of collections){
  if(!Array.isArray(x[k])||x[k].length>2000)return false;
  const ids=new Set();for(const item of x[k]){if(!item||typeof item.id!=='string'||!/^[a-zA-Z0-9_-]+$/.test(item.id)||ids.has(item.id))return false;ids.add(item.id);}
 }
 if(!x.days.length||x.days.some(d=>typeof d.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||Number.isNaN(Date.parse(d.date))))return false;
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
