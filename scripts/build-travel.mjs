import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=name=>fs.readFileSync(new URL('../travel-app/'+name,import.meta.url),'utf8').replace(/^export /gm,'');
const template=read('ui-source.html');
const modules=[['MOBILE_CSS','mobile.css'],['JOURNEY_CSS','journey.css'],['DISCOVERY_DATA','discovery-data.mjs'],['JOURNEY_UI','journey.js'],['ROUTE_UTILS','route-utils.mjs'],['PLACE_CATALOG','place-catalog.js'],['ENHANCEMENTS','enhancements.js'],['PRIVATE_UPDATE','private-update.mjs'],['STAY_UI','stay-ui.js'],['SYNC_UTILS','sync-utils.mjs'],['SYNC_UI','sync-ui.js'],['COURSE_UTILS','course-utils.mjs'],['COMPACT_COURSES','compact-courses.js'],['ENRICHMENT_UI','enrichment-ui.js'],['DAILY_FEED','daily-feed.mjs'],['DAILY_UI','daily-ui.js']];
function bundle(local=false){let html=template;for(const [marker,name] of modules){if(!html.includes('/* '+marker+' */'))throw Error('Missing UI marker: '+marker);html=html.replace('/* '+marker+' */',()=>local&&marker==='SYNC_UI'?read('local-store.mjs')+'\n'+read('local-ui.js'):local&&marker==='SYNC_UTILS'?read(name).split('async function stateResponse')[0]:read(name));}return html;}
const html=bundle().replace('\nload();',()=> '\n'+read('app-transfer.js')+'\nload();');
fs.writeFileSync(new URL('../travel-app/ui.mjs',import.meta.url),'export const HTML = '+JSON.stringify(html)+';\n');
let app=bundle(true).replace('href="/travel-assets/manifest.webmanifest"','href="/ridebook/manifest.webmanifest"').replace('</head>','<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"></head>').replace('<button id="moreBtn"','<button id="installApp" aria-label="앱 설치 및 저장 안내">앱</button><button id="moreBtn"').replace('<section id="syncNotice"','<div id="offlineStatus" class="offline-status" role="status">오프라인 준비 중…</div><section id="syncNotice"').replace('<dialog id="editor">','<dialog id="appTools" aria-labelledby="appToolsTitle"><div class="dialoghead"><h2 id="appToolsTitle">웹 · 앱 사용 안내</h2><button id="closeAppTools" aria-label="닫기">✕</button></div><div id="appToolsBody"></div></dialog><dialog id="editor">').replace('다른 기기 수정 사용','저장된 수정 사용').replace('</style>','\n'+read('local.css')+'\n</style>');
const out=new URL('../public/ridebook/',import.meta.url);fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(new URL('index.html',out),app);
const manifest={id:'/ridebook/',name:'치앙마이, 나의 속도로',short_name:'나의 속도로',description:'일정·라이딩·여행 노트를 내 기기에 저장하는 여행 앱',lang:'ko',start_url:'/ridebook/',scope:'/ridebook/',display:'standalone',background_color:'#fafbff',theme_color:'#fafbff',icons:[{src:'/travel-assets/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/travel-assets/icon-512.png',sizes:'512x512',type:'image/png'}]};
fs.writeFileSync(new URL('manifest.webmanifest',out),JSON.stringify(manifest,null,2)+'\n');
const worker=read('service-worker.js');const version=createHash('sha256').update(app+JSON.stringify(manifest)+worker).digest('hex').slice(0,16);
fs.writeFileSync(new URL('sw.js',out),worker.replace('__VERSION__',version));
console.log('Built private travel UI and local-first Ridebook '+version);
