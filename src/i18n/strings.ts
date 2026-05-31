// 모든 사이트 카피를 한 곳에 모은 i18n 사전.
// 비개발자가 카피만 빠르게 수정하고 싶을 때 이 파일 한 곳을 본다.

export type Lang = 'ko' | 'en';

export const strings = {
  ko: {
    nav: {
      features: '기능',
      howItWorks: '사용법',
      faq: '자주 묻는 질문',
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
          title: '샥즈 같은 마이크 헤드셋',
          body: '샥즈 OpenRun Pro 같은 마이크 달린 블루투스 헤드셋이면 가운데 버튼 한 번 톡 누르면 송신, 다시 한 번 누르면 끝. 길게 누를 필요 없어요.',
        },
        {
          icon: 'rabbit-headphones.png',
          title: 'AirPods Pro도 OK',
          body: 'AirPods Pro는 스템(스틱)을 두 번 빠르게 누르면 송신, 다시 두 번 누르면 끝. 자전거 라이딩 중에도 손가락 두 번이면 충분해요.',
        },
        {
          icon: 'rabbit-qr.png',
          title: '같은 코드로 만나기',
          body: '코드 하나만 공유하면 친구와 같은 방. 카톡으로 보내거나 QR로 스캔. 한 채널 최대 16명까지 동시 무전.',
        },
        {
          icon: 'rabbit-bicycle.png',
          title: '바람 소리 줄이기',
          body: '맞바람 라이딩에서도 친구 목소리는 또렷하게. 4단계 풍절음 억제로 시속 40km 이상에서도 통신이 끊기지 않아요.',
        },
      ],
      platformDiff: {
        heading: '플랫폼별 지원 헤드셋',
        ios: {
          label: 'iPhone (iOS 16+)',
          body: '샥즈 가운데 버튼 + AirPods Pro 스템 두 번 프레스 모두 지원. Apple PushToTalk 프레임워크로 화면 잠금 상태에서도 친구 목소리는 들립니다.',
        },
        android: {
          label: 'Galaxy / Android (One UI 7 이상)',
          body: '샥즈 가운데 버튼 지원. AirPods Pro는 미지원 (Android OS 한계). 별도 Telecom 통화 채널로 자전거 라이딩 중 안정적 라우팅.',
        },
      },
    },
    moreFeatures: {
      heading: '이런 기능도',
      items: [
        {
          title: '라이딩 기록 30일 자동 보관',
          body: '최근 30일 라이딩 세션이 자동 저장됩니다. 라이딩 코스/시간/같이 탄 친구/총 송신 시간 표시. 30일이 지난 기록은 자동 삭제 (개인정보 보호).',
        },
        {
          title: '송신 알림음',
          body: '마이크가 켜진 시간을 1분/2분/3분 간격으로 알려드려요. "송신 중인 거 알고 있나?" 깜빡 잊고 마이크 켜두는 실수 방지.',
        },
        {
          title: '한 채널 최대 16명',
          body: '같은 채널에 16명까지 동시 무전 가능. 단체 라이딩, 그룹 라이딩 모임 모두 OK. 16명 모두 송신 가능.',
        },
        {
          title: '안전한 인증',
          body: '소셜 로그인(Apple/Google/Kakao) 3가지 중 선택. 음성은 서버에 저장되지 않고 P2P 실시간 전송. 채널 코드도 6시간마다 자동 갱신.',
        },
        {
          title: 'Pro 구독 — 주당 20시간',
          body: 'Pro는 ₩9,900/월. 가입일 기준 매주 20시간 사용. 무료는 주 3시간 (초과 시 ₩200/시간). 첫 주 무료 체험 포함.',
        },
        {
          title: '닉네임으로 친구 구분',
          body: '같은 채널 내 친구 닉네임을 한눈에 확인. 누가 송신 중인지 라이딩 화면에 실시간 표시. 무전이 누구한테서 왔는지 헷갈리지 않아요.',
        },
      ],
    },
    howItWorks: {
      heading: '이렇게 시작해요',
      steps: [
        { num: 1, title: '헤드셋 연결', body: '샥즈, AirPods Pro 등 블루투스 헤드셋' },
        { num: 2, title: '코드로 합류', body: '카톡으로 코드 공유 또는 QR 스캔' },
        { num: 3, title: '라이딩 시작', body: '헤드셋 버튼으로 무전 시작' },
      ],
    },
    faq: {
      heading: '자주 묻는 질문',
      sub: '베타 라이더가 실제로 자주 묻는 질문들을 모았어요.',
      items: [
        {
          q: '워키토끼는 무료인가요?',
          a: '무료 플랜은 주당 3시간까지 송신 가능합니다. 더 길게 쓰시려면 Pro 구독(₩9,900/월, 주당 20시간)을 추천드려요. 첫 주는 무료 체험이라 결제 없이 Pro 한 주를 써보실 수 있어요. 무료 한도 초과 시에는 시간당 ₩200으로 그때그때 충전해서 쓰실 수도 있습니다.',
        },
        {
          q: '어떤 헤드셋이 필요한가요?',
          a: '마이크가 달린 블루투스 헤드셋이면 모두 가능합니다. 자전거 라이더 사이에서 가장 많이 쓰이는 모델은 샥즈 OpenRun Pro 2 (가운데 버튼 한 번 톡), AirPods Pro (스템 두 번 빠르게 프레스). 갤럭시 버즈는 현재 송신 시작 키가 제한적이라 권장하지 않아요.',
        },
        {
          q: 'AirPods로도 정말 되나요?',
          a: '네, iOS 17 이상에서 AirPods Pro 2세대 이상이면 작동합니다. 단, 단일 프레스는 Apple OS 정책상 불가하고 **두 번 프레스**로만 송신 시작이 됩니다. Android에서는 AirPods의 송신 키 자체가 운영체제에 전달되지 않아 미지원입니다.',
        },
        {
          q: '바람 소리가 정말 줄어드나요?',
          a: '워키토끼는 4단계 풍절음 억제를 제공합니다. 평속 25km/h 이하는 끄셔도 무방하고, 30~40km/h는 중간, 40km/h 이상은 강하게 설정하시면 친구 목소리만 깨끗하게 전달됩니다. 다운힐이나 맞바람 구간에서 가장 차이가 크게 느껴집니다.',
        },
        {
          q: '라이딩 기록은 어디서 보나요?',
          a: '앱 하단 "기록" 탭에서 최근 30일 라이딩이 표시됩니다. 라이딩 날짜, 채널 코드, 함께 탄 친구, 송신한 총 시간이 카드로 정리돼요. 30일이 지난 기록은 개인정보 보호를 위해 자동 삭제됩니다.',
        },
        {
          q: '음성이 서버에 저장되나요?',
          a: '저장되지 않습니다. 워키토끼의 음성은 P2P 실시간 전송 방식이라 채널을 닫는 순간 그 어디에도 남지 않아요. 서버에 저장되는 것은 닉네임, 채널 코드, 라이딩 시간 같은 메타데이터뿐이고 이것도 30일 후 자동 삭제됩니다.',
        },
        {
          q: '같은 채널에 몇 명까지 들어올 수 있나요?',
          a: '한 채널에 최대 16명까지 동시 무전 가능합니다. 단체 라이딩, 동호회 그룹 라이딩 모두 충분히 커버됩니다. 17명 이상이면 채널 두 개로 나눠서 운영하시는 것을 권장해요.',
        },
        {
          q: '잠금 화면 상태에서도 친구 목소리가 들리나요?',
          a: 'iOS는 Apple PushToTalk 프레임워크 덕분에 잠금 상태에서도 친구 목소리가 자동 재생됩니다. Android는 알림 권한을 허용하시면 잠금 화면 위에 워키토끼 알림이 떠서 들립니다. 단, 잠금 상태에서 "내가 송신 시작"은 iOS 보안 정책상 헤드셋 버튼으로만 가능합니다.',
        },
        {
          q: '전화가 오면 어떻게 되나요?',
          a: '일반 전화나 카톡 보이스톡이 오면 워키토끼가 자동으로 일시정지되고, 통화가 끝나면 자동으로 복구됩니다. 별도 조작 없이 통화→무전 전환이 매끄럽게 이루어져요. 단, 통화 중에는 다른 친구의 무전이 들리지 않습니다.',
        },
        {
          q: 'Apple Watch나 Galaxy Watch에서도 쓸 수 있나요?',
          a: '현재는 iPhone과 Android 폰에서만 작동합니다. Watch 지원은 정식 출시 이후 검토 예정입니다.',
        },
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
      address: '서울특별시 강남구 논현로10길 30',
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
      faq: 'FAQ',
      reviews: 'Reviews',
      beta: 'Join the beta',
      langSwitch: '한국어',
      langSwitchHref: '/',
    },
    hero: {
      badge: 'Now in beta',
      title1: 'Talk with your cycling friends',
      title2: 'in real time.',
      sub1: 'One tap on your headset button to transmit.',
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
          title: 'Bone-conduction headsets like Shokz',
          body: 'With Shokz OpenRun Pro (or any Bluetooth headset with a mic), tap the center button once to transmit, tap again to stop. No hold-to-talk.',
        },
        {
          icon: 'rabbit-headphones.png',
          title: 'AirPods Pro work too',
          body: 'On AirPods Pro, tap the stem twice quickly to start, tap twice again to stop. Two taps is all it takes — even mid-ride.',
        },
        {
          icon: 'rabbit-qr.png',
          title: 'Meet with one code',
          body: 'Share a code, ride together. Send via chat or scan a QR. Up to 16 riders on the same channel.',
        },
        {
          icon: 'rabbit-bicycle.png',
          title: 'Crystal clear voices',
          body: '4-level wind noise reduction keeps your friend’s voice clear, even into a 40 km/h headwind.',
        },
      ],
      platformDiff: {
        heading: 'Supported headsets per platform',
        ios: {
          label: 'iPhone (iOS 16+)',
          body: 'Shokz center button + AirPods Pro double tap both supported. Apple’s PushToTalk framework lets you hear friends even with the screen locked.',
        },
        android: {
          label: 'Galaxy / Android (One UI 7+)',
          body: 'Shokz center button supported. AirPods Pro not supported (Android OS limitation). A dedicated Telecom channel keeps audio routing stable mid-ride.',
        },
      },
    },
    moreFeatures: {
      heading: 'Built in',
      items: [
        {
          title: 'Ride history — 30 days',
          body: 'The last 30 days of rides are saved automatically: date, channel code, who you rode with, and total transmit time. Older than 30 days is auto-deleted for privacy.',
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
          body: 'Sign in with Apple, Google, or Kakao. Voice is sent peer-to-peer in real time and never stored on our servers. Channel codes auto-rotate every 6 hours.',
        },
        {
          title: 'Pro — 20 hours per week',
          body: 'Pro is ₩9,900 / month. From your sign-up date, you get 20 hours per week. Free users get 3 hours/week (₩200/hr overage). First week of Pro is free.',
        },
        {
          title: 'Names you actually see',
          body: 'See everyone in the channel by nickname. The live screen shows who’s transmitting right now, so you always know whose voice is whose.',
        },
      ],
    },
    howItWorks: {
      heading: 'Get started',
      steps: [
        { num: 1, title: 'Connect a headset', body: 'Shokz, AirPods Pro, or any Bluetooth headset' },
        { num: 2, title: 'Join with a code', body: 'Share via chat or scan a QR' },
        { num: 3, title: 'Start riding', body: 'Press the headset button to talk' },
      ],
    },
    faq: {
      heading: 'Frequently asked',
      sub: 'Real questions from real beta riders.',
      items: [
        {
          q: 'Is WalkieTokki free?',
          a: 'Free plan gives you 3 hours of transmit time per week. For more, Pro (₩9,900/month) gives you 20 hours per week, and the first week is on us. You can also pay-as-you-go at ₩200/hr if you go over the free limit.',
        },
        {
          q: 'What kind of headset do I need?',
          a: 'Any Bluetooth headset with a mic. Most popular among cyclists: Shokz OpenRun Pro 2 (single center-button tap) and AirPods Pro (double stem tap). Galaxy Buds aren’t recommended yet — their button mapping is limited.',
        },
        {
          q: 'AirPods really work for this?',
          a: 'Yes, on iOS 17+ with AirPods Pro (2nd gen or newer). Note: single-press isn’t possible due to Apple OS policy — only the **double press** starts a transmit. On Android, AirPods’ transmit key isn’t routed to apps, so it’s not supported there.',
        },
        {
          q: 'Does wind noise reduction actually help?',
          a: 'WalkieTokki has 4 levels. Off is fine under 25 km/h, medium for 30–40 km/h, strong for over 40 km/h. The difference is most obvious on descents and into a headwind.',
        },
        {
          q: 'Where do I see my ride history?',
          a: 'Under the "Records" tab — the last 30 days of rides as cards (date, channel code, who you rode with, total transmit time). Older than 30 days is auto-deleted for privacy.',
        },
        {
          q: 'Is my voice stored anywhere?',
          a: 'No. Voice is peer-to-peer in real time and gone the moment the channel closes. Servers only hold metadata (nicknames, channel codes, ride times) and that also auto-deletes after 30 days.',
        },
        {
          q: 'How many people can be in one channel?',
          a: 'Up to 16 at the same time. Plenty for club rides. If you need 17+, split into two channels.',
        },
        {
          q: 'Can I hear friends with the screen locked?',
          a: 'On iOS, yes — Apple’s PushToTalk framework plays incoming voice through the lock screen automatically. On Android, allow notifications and an overlay shows incoming transmits. Starting transmit on a locked iPhone is only possible from the headset button (security policy).',
        },
        {
          q: 'What happens if a phone call comes in?',
          a: 'WalkieTokki pauses automatically and resumes when the call ends. The handover is seamless. During the call, you won’t hear other riders.',
        },
        {
          q: 'Apple Watch / Galaxy Watch support?',
          a: 'Not yet. Currently iPhone and Android phones only. Watch support is under review for after public launch.',
        },
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
      address: '30 Nonhyeon-ro 10-gil, Gangnam-gu, Seoul, South Korea',
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
