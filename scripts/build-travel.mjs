import fs from 'node:fs';
// The UI contains no seed or personal booking data. Import data after authentication.
let html=fs.readFileSync(new URL('../travel-app/ui-source.html',import.meta.url),'utf8');
for(const [marker,name] of [['MOBILE_CSS','mobile.css'],['ROUTE_UTILS','route-utils.mjs'],['PLACE_CATALOG','place-catalog.js'],['ENHANCEMENTS','enhancements.js']]){
 const source=fs.readFileSync(new URL('../travel-app/'+name,import.meta.url),'utf8').replace(/^export /gm,'');
 if(!html.includes('/* '+marker+' */'))throw Error('Missing UI marker: '+marker);
 html=html.replace('/* '+marker+' */',()=>source);
}
fs.writeFileSync(new URL('../travel-app/ui.mjs',import.meta.url),'export const HTML = '+JSON.stringify(html)+';\n');
