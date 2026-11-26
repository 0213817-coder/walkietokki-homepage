// Public editorial suggestions only. No personal trip or booking data.
export const discoveries=[
 {id:'new-tram',closes:21,name:'페달 대신, 새 트램',place:'Chiang Mai Tram by Lannatique',area:'창모이 · 올드타운',theme:'도시 산책',fresh:'2026.11 시작',duration:'1–2시간',minutes:90,effort:'easy',period:'afternoon',description:'익숙한 골목을 차창 너머로. 새 전기 관광 트램을 타고 마음에 드는 동네에서 잠깐 내려보세요.',hours:'매일 09:00–21:00',caution:'출발 전 공식 노선·정류장·운행간격 확인. 소요시간은 자유 관람 제안입니다.',query:'The Zheng He Heritage House Chiang Mai',url:'https://www.assetworldcorp-th.com/en/newsroom/news-activities/1155/all-aboard-chiang-mai-s-first-tram-takes-to-the-city',icon:'tram',image:'https://www.assetworldcorp-th.com/storage/newsroom/news-activities/2026/11/20261120-101036-1.webp'},
 {id:'jingjai-wednesday',closes:12,name:'수요일 아침의 징짜이',place:'Jing Jai Wednesday Market',area:'징짜이 마켓',theme:'아침 시장',fresh:'2026.06 시작',duration:'45–75분',minutes:60,effort:'easy',period:'morning',weekdays:[3],description:'주말 라이딩은 그대로. 새 수요일 시장에서 아침밥과 커피, 지역 농산물을 만나보세요.',hours:'수요일 06:30–12:00',caution:'정오 전에 방문하세요. 연말 특별휴무는 공식 공지를 확인하세요.',query:'Jing Jai Market Chiang Mai',url:'https://www.jingjaicentralchiangmai.com/central-activity/178',icon:'market'},
 {id:'broken-stories',closes:21.5,name:'남의 추억을 읽는 저녁',place:'Museum of Broken Relationships',area:'창모이',theme:'이야기 · 전시',duration:'60–90분',minutes:75,effort:'easy',period:'evening',closedDates:['01-01'],description:'물건 하나에 남은 사랑과 이별의 이야기. 관람 뒤 창모이 골목에서 저녁을 이어가도 좋아요.',hours:'매일 10:00–22:00 · 마지막 입장 21:30',caution:'1월 1일 휴관. 설명은 태국어·영어입니다. 2024년에 문을 연 공간이며 이번 여행의 발견 후보입니다.',query:'Museum of Broken Relationships Chiang Mai',url:'https://brokenships.com/visit/museum-details/chiang-mai',icon:'stories'},
 {id:'kalm-makers',closes:18.5,name:'손으로 여행을 남기는 오후',place:'Kalm Village',area:'올드타운 남쪽',theme:'공예 · 건축',duration:'1–2시간',minutes:90,effort:'easy',period:'afternoon',closedWeekdays:[3],description:'직물과 공예 아카이브를 천천히 둘러보기. 일정이 맞으면 작은 직조 워크숍도 골라보세요.',hours:'09:30–18:30 · 수요일 휴무',caution:'워크숍은 별도 예약·시간 확인이 필요합니다. 정기 프로그램이 여행일에 열리는지는 예약 전에 확인하세요.',query:'Kalm Village Chiang Mai',url:'https://www.kalmvillage.com/programs',icon:'craft',image:'https://images.squarespace-cdn.com/content/v1/633958797ee37b08e217ae42/38c9946b-2641-4dfa-8e01-afd8880c7e54/L1954391.jpg'},
 {id:'maiiam-art',closes:18,name:'거울벽 너머, 태국 현대미술',place:'MAIIAM Contemporary Art Museum',area:'산캄팽',theme:'현대미술',duration:'1–2시간 + 이동',minutes:120,effort:'outing',period:'afternoon',closedWeekdays:[2],description:'북부의 사원과 카페 다음에는 현대미술. 거울 외벽을 지나 태국과 동남아 작가의 시선을 만나보세요.',hours:'10:00–18:00 · 화요일 휴관',caution:'시내 밖 이동이 필요합니다. 방문일 전시와 연말 운영일을 공식 페이지에서 확인하세요.',query:'MAIIAM Contemporary Art Museum',url:'https://maiiam.com/en/visit',icon:'art',image:'https://cdn.sanity.io/images/e0xvz2za/production/5df55001c30f551f0ef03c981a463d3ed2ede51d-1200x900.jpg?q=75'},
 {id:'akha-coffee',closes:17.5,name:'농부 이름으로 고르는 커피',place:'Akha Ama Phrasingh',area:'왓 프라싱 근처',theme:'북부 커피',duration:'30–45분',minutes:40,effort:'easy',period:'afternoon',description:'한 잔을 마시더라도 생산자 이야기가 있는 원두로. 마음에 든 맛을 여행의 기념품으로 가져가세요.',hours:'매일 08:00–17:30',caution:'Phrasingh 지점 기준입니다. 별도 커핑·농장 투어가 포함된 프로그램은 아닙니다.',query:'Akha Ama Phrasingh Chiang Mai',url:'https://www.akhaamacoffee.com/',icon:'coffee'}
];
export let discoveryChecked='2026-11-23';
export function discoveryAvailability(item,date,clock){
 if(item.startsOn&&date<item.startsOn)return '행사 시작 전';
 if(item.endsOn&&date>item.endsOn)return '행사 종료';
 const weekday=new Date(date+'T12:00:00Z').getUTCDay();
 if(item.closedDates?.includes(date.slice(5)))return '휴관일';
 if(item.closedWeekdays?.includes(weekday))return '정기 휴무';
 if(item.weekdays&&!item.weekdays.includes(weekday))return '수요일 오전 운영';
 if(item.closes!==null&&clock?.date===date&&clock.hour>=item.closes)return '오늘 운영 종료';
 return '';
}
export function discoveryIsKnown(state,item){
 if(state.discoveryLog?.[item.id]?.visited||state.discoveryLog?.[item.id]?.known)return true;
 const normalize=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
 return state.places.some(p=>p.visited&&[item.place,item.name].some(n=>normalize(n)===normalize(p.name)));
}
export function discoveryRecommendations(state,day,clock){
 const quiet=day.rideKind==='라이딩'||day.intensity==='최고강도';
 return discoveries.filter(x=>!discoveryIsKnown(state,x)&&!discoveryAvailability(x,day.date,clock)&&(!quiet||x.effort==='easy'))
 .map(x=>({item:x,score:(state.discoveryLog?.[x.id]?.saved?8:0)+(x.fresh?3:0)+(x.weekdays?5:0)+(day.rideKind==='휴식'&&x.effort==='outing'?6:0)+(quiet&&x.minutes<=60?4:0)}))
 .sort((a,b)=>b.score-a.score).map(x=>x.item);
}
