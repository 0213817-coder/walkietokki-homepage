// 모든 사이트 카피를 한 곳에 모은 i18n 사전.
// 비개발자가 카피만 빠르게 수정하고 싶을 때 이 파일 한 곳을 본다.

export type Lang = 'ko' | 'en';

export const strings = {
  ko: {
    nav: {
      features: '기능',
      faq: '자주 묻는 질문',
      reviews: '후기',
      download: '다운로드',
      beta: '다운로드',
      langSwitch: 'EN',
      langSwitchHref: '/en/',
    },
    hero: {
      badge: 'App Store 출시',
      title1: '자전거 친구와',
      title2: '실시간으로 대화하세요.',
      sub1: '헤드셋 버튼 한 번 톡 누르면 송신.',
      sub2: '여러분의 라이딩, 워키토끼가 함께합니다.',
      ctaPrimary: '앱 다운로드',
      ctaSecondary: '자세히 보기',
      ctaPrimaryHref: '/download',
    },
    coreFeatures: {
      heading: '핵심 기능',
      sub: '워키토끼는 자전거 라이딩에 최적화된 PTT 무전 앱이에요. 사용법은 헤드셋 종류에 따라 다릅니다.',
      items: [
        {
          icon: 'rabbit-headphones.png',
          title: '마이크가 있는 블루투스 헤드셋으로 사용',
          body: '가운데 버튼 한 번 톡 누르면 말하기, 다시 누르면 끝. 길게 누를 필요 없어요.',
          note: '',
        },
        {
          icon: 'rabbit-airpods.png',
          title: '이어버즈로 사용',
          body: '헤드셋과는 다르게, 이어버즈는 스템을 톡톡 두 번 누르면 말하기, 다시 두 번 누르면 끝. (AirPods Pro 기준)',
          note: 'iOS: 두 번 톡 누르면 송신 / 종료. 갤럭시: 송신 시작 1번, 종료 두 번 (AirPods Pro 기준).',
        },
        {
          icon: 'rabbit-qr.png',
          title: '같은 코드로 만나기',
          body: '코드 하나만 공유하면 친구와 같은 방. 카톡으로 보내거나 QR로 스캔.',
          note: '',
        },
        {
          icon: 'rabbit-bicycle.png',
          title: '바람 소리 줄이기',
          body: '맞바람 라이딩에서도 친구 목소리는 또렷하게. 바람소리를 줄여줘요.',
          note: '',
        },
      ],
    },
    moreFeatures: {
      heading: '이런 기능도',
      items: [
        {
          title: '라이딩 기록 30일',
          body: '최근 30일 라이딩 세션이 폰에 표시됩니다. 라이딩 날짜, 채널 코드, 함께 탄 친구, 총 시간이 카드로 정리돼요.',
        },
        {
          title: '송신 알림음',
          body: '마이크가 켜진 시간을 1분/2분/3분 간격으로 알려드려요. 깜빡 잊고 마이크 켜두는 실수 방지.',
        },
        {
          title: '한 채널 최대 16명',
          body: '같은 채널에 16명까지 동시 무전 가능. 단체 라이딩, 그룹 라이딩 모임 모두 OK. 16명 모두 송신 가능.',
        },
        {
          title: '안전한 인증',
          body: '소셜 로그인(Apple/Google/Kakao) 3가지 중 선택. 음성은 서버에 저장되지 않고 P2P 실시간 전송.',
        },
        {
          title: '요금제 — Free · Pro · Ultra',
          body: '무료는 주 3시간. Pro는 월 ₩5,500에 주 10시간, Ultra는 월 ₩9,900에 주 20시간. Pro와 Ultra는 첫 7일 무료 체험.',
        },
        {
          title: '음악 들으면서 무전',
          body: '듣던 음악을 끄지 않아도 돼요. 라이딩 중 음악은 그대로 흐르고, 친구 목소리도 함께 들립니다.',
        },
      ],
    },
    faq: {
      heading: '자주 묻는 질문',
      sub: '라이더들이 실제로 자주 묻는 질문들을 모았어요.',
      items: [
        {
          q: '워키토끼는 무료인가요?',
          a: '무료 플랜으로 주 3시간까지 쓸 수 있어요. 더 필요하면 Pro(월 ₩5,500 · 주 10시간) 또는 Ultra(월 ₩9,900 · 주 20시간)로 업그레이드할 수 있고, 첫 7일은 무료 체험입니다.',
        },
        {
          q: '주당 시간의 산정 기준은 어떻게 되나요?',
          a: '가입한 날을 기준으로 시작됩니다. 매주 같은 요일에 사용 시간이 자동으로 재설정돼요. 예를 들어 화요일에 가입하셨다면 매주 화요일마다 한도가 새로 시작됩니다.',
        },
        {
          q: '어떤 헤드셋이 필요한가요?',
          a: '마이크가 달린 블루투스 헤드셋이면 모두 가능합니다. 일반적인 골전도 헤드셋, 일반 이어버즈, AirPods Pro 등이 작동합니다. 구체적인 추천 모델은 사용 데이터가 모이는 대로 안내드릴 예정이에요.',
        },
        {
          q: 'AirPods로도 정말 되나요?',
          a: '네, AirPods Pro 2세대 이상에서 작동합니다. iOS는 단일 프레스가 Apple OS 정책상 불가해 두 번 프레스로 송신 시작/종료를 모두 처리합니다. 갤럭시 스마트폰에서는 한 번 프레스로 송신 시작, 두 번 프레스로 송신 종료입니다.',
        },
        {
          q: '라이딩 기록은 어디서 보나요?',
          a: '앱 하단 "기록" 탭에서 최근 30일 라이딩이 표시됩니다. 라이딩 날짜, 채널 코드, 함께 탄 친구, 총 시간이 카드로 정리돼요.',
        },
        {
          q: '음성이 서버에 저장되나요?',
          a: '저장되지 않습니다. 워키토끼의 음성은 P2P 실시간 전송 방식이라 채널을 닫는 순간 그 어디에도 남지 않아요. 서버에 저장되는 것은 닉네임, 채널 코드 같은 메타데이터뿐입니다.',
        },
        {
          q: '같은 채널에 몇 명까지 들어올 수 있나요?',
          a: '한 채널에 최대 16명까지 동시 무전 가능합니다. 단체 라이딩, 동호회 그룹 라이딩 모두 충분히 커버됩니다. 17명 이상이면 채널 두 개로 나눠서 운영하시는 것을 권장해요.',
        },
        {
          q: '잠금 화면 상태에서도 친구 목소리가 들리나요?',
          a: '네, 잠금 상태에서도 친구 목소리는 자동으로 들립니다. 화면을 깨우지 않아도 라이딩 중 친구의 무전을 놓치지 않아요.',
        },
        {
          q: '전화가 오면 어떻게 되나요?',
          a: '일반 전화나 카톡 보이스톡이 오면 워키토끼가 자동으로 일시정지되고, 통화가 끝나면 자동으로 복구됩니다. 별도 조작 없이 통화→무전 전환이 매끄럽게 이루어져요. 단, 통화 중에는 다른 친구의 무전이 들리지 않습니다.',
        },
        {
          q: '라이딩 중 영상(비디오) 촬영이 되나요?',
          a: '송신(말하기) 중에는 영상 촬영이 되지 않아요. 마이크를 함께 쓰기 때문이에요. 라이딩 중 영상을 찍고 싶다면 송신만 종료하면 됩니다 — 채널에서 나가는 게 아니라 송신 상태만 끄는 거라, 그대로 채널에 남은 채 촬영할 수 있어요.',
        },
      ],
    },
    betaBanner: {
      heading: '지금 바로 시작하세요',
      body: 'App Store에서 워키토끼를 받고, 친구와 같은 채널로 만나요.',
      cta: '앱 다운로드',
      ctaHref: '/download',
    },
    reviews: {
      heading: '라이더들의 후기',
      placeholder: '곧 만나봐요.',
    },
    footer: {
      company: '위키드프로덕션',
      brn: '사업자등록번호 248-02-04034',
      address: '서울특별시 강남구 논현로10길 30',
      email: 'support@walkietokki.com',
      links: [
        { label: '다운로드', href: '/download' },
        { label: '약관', href: '/terms' },
        { label: '개인정보처리방침', href: '/privacy' },
        { label: '오픈소스', href: '/licenses' },
        { label: '문의', href: '/contact' },
        { label: 'English', href: '/en/' },
      ],
    },
    meta: {
      siteName: '워키토끼',
      tagline: '자전거 친구와 실시간 무전',
      description: '자전거 라이더를 위한 PTT 무전 앱. 헤드셋 버튼 한 번 톡 누르면 친구와 실시간 대화.',
    },
  },
  en: {
    nav: {
      features: 'Features',
      faq: 'FAQ',
      reviews: 'Reviews',
      download: 'Download',
      beta: 'Download',
      langSwitch: '한국어',
      langSwitchHref: '/',
    },
    hero: {
      badge: 'Now on the App Store',
      title1: 'Talk with your cycling friends',
      title2: 'in real time.',
      sub1: 'One tap on your headset button to transmit.',
      sub2: 'WalkieTokki rides with you.',
      ctaPrimary: 'Download the app',
      ctaSecondary: 'Learn more',
      ctaPrimaryHref: '/en/download',
    },
    coreFeatures: {
      heading: 'Core features',
      sub: 'WalkieTokki is built for cycling. The way you transmit depends on the kind of headset you wear.',
      items: [
        {
          icon: 'rabbit-headphones.png',
          title: 'Bluetooth headset with a mic',
          body: 'Tap the center button once to talk, tap again to stop. No need to hold.',
          note: '',
        },
        {
          icon: 'rabbit-airpods.png',
          title: 'Earbuds',
          body: 'Unlike headsets, earbuds need a double tap on the stem to start, and another double tap to stop. (AirPods Pro reference)',
          note: 'iOS: double tap to start / stop. Galaxy: single press to start, double press to stop (AirPods Pro reference).',
        },
        {
          icon: 'rabbit-qr.png',
          title: 'Meet with one code',
          body: 'Share a code, ride together. Send it in chat or scan a QR.',
          note: '',
        },
        {
          icon: 'rabbit-bicycle.png',
          title: 'Crystal clear voices',
          body: 'Even into a headwind, your friend’s voice stays clear. Wind noise reduction handles it.',
          note: '',
        },
      ],
    },
    moreFeatures: {
      heading: 'Built in',
      items: [
        {
          title: 'Ride history — 30 days',
          body: 'The last 30 days of rides are shown on your phone: date, channel code, who you rode with, and total time.',
        },
        {
          title: 'Transmit reminder',
          body: 'A gentle ping every 1, 2, or 3 minutes while your mic is on. So you never forget the channel is hot.',
        },
        {
          title: 'Up to 16 riders',
          body: 'Up to 16 people on the same channel at once. Plenty for club rides and group rides — everyone can transmit.',
        },
        {
          title: 'Secure by default',
          body: 'Sign in with Apple, Google, or Kakao. Voice is sent peer-to-peer in real time and never stored on our servers.',
        },
        {
          title: 'Plans — Free · Pro · Ultra',
          body: 'Free gives you 3 hours a week. Pro is ₩5,500/month for 10 hours a week, and Ultra is ₩9,900/month for 20 hours a week. Pro and Ultra include a 7-day free trial.',
        },
        {
          title: 'Music keeps playing',
          body: 'No need to stop your music. Your tunes keep playing while you ride, with your friends’ voices mixed in on top.',
        },
      ],
    },
    faq: {
      heading: 'Frequently asked',
      sub: 'Real questions from real riders.',
      items: [
        {
          q: 'Is WalkieTokki free?',
          a: 'The free plan gives you up to 3 hours a week. Need more? Upgrade to Pro (₩5,500/month · 10 hours/week) or Ultra (₩9,900/month · 20 hours/week) — the first 7 days are a free trial.',
        },
        {
          q: 'How is the weekly limit calculated?',
          a: 'It starts from your sign-up date. Your usage resets automatically on the same weekday each week. For example, if you signed up on a Tuesday, your limit resets every Tuesday.',
        },
        {
          q: 'What kind of headset do I need?',
          a: 'Any Bluetooth headset with a mic. Bone-conduction headsets, regular earbuds, and AirPods Pro all work. We’ll publish specific recommended models as usage data comes in.',
        },
        {
          q: 'AirPods really work for this?',
          a: 'Yes, with AirPods Pro (2nd gen or newer). On iOS, single-press isn’t possible due to Apple OS policy — only the double press starts/stops a transmit. On Galaxy smartphones, it’s single press to start, double press to stop.',
        },
        {
          q: 'Where do I see my ride history?',
          a: 'Under the "Records" tab — the last 30 days of rides as cards (date, channel code, who you rode with, total time).',
        },
        {
          q: 'Is my voice stored anywhere?',
          a: 'No. Voice is peer-to-peer in real time and gone the moment the channel closes. Servers only hold metadata like nicknames and channel codes.',
        },
        {
          q: 'How many people can be in one channel?',
          a: 'Up to 16 at the same time. Plenty for club rides. If you need 17+, split into two channels.',
        },
        {
          q: 'Can I hear friends with the screen locked?',
          a: 'Yes, incoming voice plays automatically even on the lock screen. You don’t have to wake the phone — you won’t miss a friend’s transmit mid-ride.',
        },
        {
          q: 'What happens if a phone call comes in?',
          a: 'WalkieTokki pauses automatically and resumes when the call ends. The handover is seamless. During the call, you won’t hear other riders.',
        },
        {
          q: 'Can I record video while riding?',
          a: 'You can’t record video while you’re transmitting (talking) — the mic is in use. To film during a ride, just end your transmission. You don’t leave the channel; you only turn transmit off, so you can record while staying in the channel.',
        },
      ],
    },
    betaBanner: {
      heading: 'Start riding today',
      body: 'Get WalkieTokki on the App Store and meet your friends in the same channel.',
      cta: 'Download the app',
      ctaHref: '/en/download',
    },
    reviews: {
      heading: 'From our riders',
      placeholder: 'Coming soon.',
    },
    footer: {
      company: 'Wikid Production',
      brn: 'Business Reg. No. 248-02-04034',
      address: '30 Nonhyeon-ro 10-gil, Gangnam-gu, Seoul, South Korea',
      email: 'support@walkietokki.com',
      links: [
        { label: 'Download', href: '/en/download' },
        { label: 'Terms', href: '/en/terms' },
        { label: 'Privacy', href: '/en/privacy' },
        { label: 'Open source', href: '/en/licenses' },
        { label: 'Contact', href: '/en/contact' },
        { label: '한국어', href: '/' },
      ],
    },
    meta: {
      siteName: 'WalkieTokki',
      tagline: 'Real-time radio for cyclists',
      description: 'A PTT walkie-talkie app for cyclists. One tap on your headset to talk with your friends.',
    },
  },
} as const;

export function t(lang: Lang) {
  return strings[lang];
}
