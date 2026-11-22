import fs from 'node:fs';
// The UI contains no seed or personal booking data. Import data after authentication.
let html=fs.readFileSync(new URL('../travel-app/ui-source.html',import.meta.url),'utf8');
for(const [marker,name] of [['MOBILE_CSS','mobile.css'],['JOURNEY_CSS','journey.css'],['DISCOVERY_DATA','discovery-data.mjs'],['JOURNEY_UI','journey.js'],['ROUTE_UTILS','route-utils.mjs'],['PLACE_CATALOG','place-catalog.js'],['ENHANCEMENTS','enhancements.js'],['PRIVATE_UPDATE','private-update.mjs'],['STAY_UI','stay-ui.js'],['SYNC_UTILS','sync-utils.mjs'],['SYNC_UI','sync-ui.js'],['COURSE_UTILS','course-utils.mjs'],['COMPACT_COURSES','compact-courses.js']]){
 const source=fs.readFileSync(new URL('../travel-app/'+name,import.meta.url),'utf8').replace(/^export /gm,'');
 if(!html.includes('/* '+marker+' */'))throw Error('Missing UI marker: '+marker);
 html=html.replace('/* '+marker+' */',()=>source);
}
fs.writeFileSync(new URL('../travel-app/ui.mjs',import.meta.url),'export const HTML = '+JSON.stringify(html)+';\n');
