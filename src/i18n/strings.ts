// 모든 사이트 카피를 한 곳에 모은 i18n 사전.
// 비개발자가 카피만 빠르게 수정하고 싶을 때 이 파일 한 곳을 본다.

export type Lang = 'ko' | 'en';

export const strings = {
  ko: {
    nav: {
      features: '기능',
      howItWorks: '사용법',
      reviews: '후기',
      beta: '베타 신청',
      langSwitch: 'EN',
      langSwitchHref: '/en/',
    },
    hero: {
      badge: '베타 테스터 모집 중',
      title1: '자전거 친구와',
      title2: '실시간으로 대화하세요.',
      sub1: '헤드셋 버튼 한 번 톡 누르면 송신.',
      sub2: '여러분의 라이딩, 워키토끼가 함께합니다.',
      ctaPrimary: '베타 신청하기',
      ctaSecondary: '자세히 보기',
      ctaPrimaryHref: '/beta',
    },
    coreFeatures: {
      heading: '핵심 기능',
      items: [
        {
          icon: 'rabbit-headphones.png',
          title: '마이크가 있는 블루투스 헤드셋으로 사용',
          body: '가운데 버튼 한 번 톡 누르면 말하기, 다시 누르면 끝. 길게 누를 필요 없어요.',
        },
        {
          icon: 'rabbit-qr.png',
          title: '같은 코드로 만나기',
          body: '코드 하나만 공유하면 친구와 같은 방. 카톡으로 보내거나 QR로 스캔.',
        },
        {
          icon: 'rabbit-bicycle.png',
          title: '바람 소리 줄이기',
          body: '맞바람 라이딩에서도 친구 목소리는 또렷하게. 바람소리를 줄여줘요.',
        },
      ],
    },
    moreFeatures: {
      heading: '이런 기능도',
      items: [
        { title: '라이딩 기록', body: '최근 30일 라이딩이 자동 저장됩니다.' },
        { title: '송신 알림음', body: '마이크가 켜진 시간을 1분/2분/3분 간격으로 알려드려요.' },
        { title: '최대 16명', body: '같은 채널에 16명까지 동시 무전 가능.' },
        { title: '안전한 인증', body: '서버 토큰 기반 + 음성은 서버에 저장되지 않아요.' },
      ],
    },
    howItWorks: {
      heading: '이렇게 시작해요',
      steps: [
        { num: 1, title: '헤드셋 연결', body: '샥즈, AirPods 등 블루투스 헤드셋' },
        { num: 2, title: '코드로 합류', body: '카톡으로 코드 공유 또는 QR 스캔' },
        { num: 3, title: '라이딩 시작', body: '가운데 버튼 톡 누르면 무전 시작' },
      ],
    },
    betaBanner: {
      heading: '지금 베타 테스트 모집 중',
      body: '친구와 함께 한 달간 무료로 사용해보세요.',
      cta: '베타 신청하기',
      ctaHref: '/beta',
    },
    reviews: {
      heading: '베타 라이더들의 후기',
      placeholder: '곧 만나봐요.',
    },
    footer: {
      company: '위키드프로덕션',
      brn: '사업자등록번호 248-02-04034',
      address: '서울특별시 강남구 (코워크시티 강남구 직영점 비상주 사무실)',
      email: 'support@walkietokki.com',
      links: [
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
      howItWorks: 'How it works',
      reviews: 'Reviews',
      beta: 'Join the beta',
      langSwitch: '한국어',
      langSwitchHref: '/',
    },
    hero: {
      badge: 'Now in beta',
      title1: 'Talk with your cycling friends',
      title2: 'in real time.',
      sub1: "One tap on your headset button to transmit.",
      sub2: 'WalkieTokki rides with you.',
      ctaPrimary: 'Join the beta',
      ctaSecondary: 'Learn more',
      ctaPrimaryHref: '/en/beta',
    },
    coreFeatures: {
      heading: 'Core features',
      items: [
        {
          icon: 'rabbit-headphones.png',
          title: 'Just tap your headset',
          body: 'Tap once to transmit, tap again to stop. No need to hold.',
        },
        {
          icon: 'rabbit-qr.png',
          title: 'Meet with one code',
          body: 'Share a code, ride together. Send via messaging or scan a QR.',
        },
        {
          icon: 'rabbit-bicycle.png',
          title: 'Crystal clear voices',
          body: "Wind noise reduction keeps your friend's voice clear, even into a headwind.",
        },
      ],
    },
    moreFeatures: {
      heading: 'Built in',
      items: [
        { title: 'Ride history', body: 'The last 30 days of rides are saved automatically.' },
        { title: 'Transmit reminder', body: 'A gentle ping every 1, 2, or 3 minutes while your mic is on.' },
        { title: 'Up to 16 riders', body: 'Up to 16 people on the same channel at once.' },
        { title: 'Secure by default', body: 'Token-based auth, and your voice is never stored on our servers.' },
      ],
    },
    howItWorks: {
      heading: 'Get started',
      steps: [
        { num: 1, title: 'Connect a headset', body: 'Shokz, AirPods or any Bluetooth headset' },
        { num: 2, title: 'Join with a code', body: 'Share the code in chat or scan a QR' },
        { num: 3, title: 'Start riding', body: 'Tap the center button to talk' },
      ],
    },
    betaBanner: {
      heading: 'Beta testing is open',
      body: 'Ride with your friends for a free month.',
      cta: 'Join the beta',
      ctaHref: '/en/beta',
    },
    reviews: {
      heading: 'From our beta riders',
      placeholder: 'Coming soon.',
    },
    footer: {
      company: 'Wikid Production',
      brn: 'Business Reg. No. 248-02-04034',
      address: 'Gangnam-gu, Seoul, South Korea',
      email: 'support@walkietokki.com',
      links: [
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
