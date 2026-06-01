# 📝 카피 수정 가이드 (Yohan 전용)

> **단 하나의 파일만 보세요**: `src/i18n/strings.ts`
> 한국어 카피 + 영어 카피 + 푸터 + 메타데이터 다 여기 있어요.
> 변호사 자문 받는 약관/개인정보만 `src/content/ko/terms.md`, `privacy.md` 별도.

---

## 1. 가장 쉬운 방법 — 브라우저에서 바로 수정 (Terminal 안 켜도 됨)

### 🌐 단축 URL (이거 하나만 기억하세요)

```
https://github.com/0213817-coder/walkietokki-homepage/edit/main/src/i18n/strings.ts
```

이 링크 클릭하면 **GitHub 웹 에디터**가 바로 열려요. VS Code랑 똑같이 생긴 화면.

### 흐름 (30초)

1. 위 링크 클릭
2. 코드 보임 → 원하는 카피 찾아서 수정 (Cmd+F로 검색)
3. 우측 상단 초록 **"Commit changes..."** 버튼 클릭
4. 커밋 메시지 입력 (예: "Pro 가격 변경") → **"Commit changes"** 한 번 더
5. 🎉 **30~60초 후 walkietokki.com에 자동 반영**

> 비유: 카페 메뉴판 글자 한 줄만 매니저가 끼적여도 가게 메뉴 칠판이 자동 갱신되는 셈. 매장 안 들어갈 필요 X.

---

## 2. 자주 바꾸는 6가지 — 라인 번호 + 예시

### 📌 Hero 헤드라인 (메인 첫 화면 큰 글자)

찾기: `hero: {`

```ts
ko: {
  hero: {
    badge: '베타 테스터 모집 중',        // ← 우상단 작은 칩
    title1: '자전거 친구와',              // ← H1 첫 줄
    title2: '실시간으로 대화하세요.',     // ← H1 둘째 줄
    sub1: '헤드셋 버튼 한 번 톡 누르면 송신.',  // ← 본문 첫 줄
    sub2: '여러분의 라이딩, 워키토끼가 함께합니다.',  // ← 본문 둘째 줄
    ctaPrimary: '베타 신청하기',          // ← 파란 버튼 텍스트
    ctaSecondary: '자세히 보기',          // ← 회색 버튼 텍스트
    ctaPrimaryHref: '/beta',              // ← 파란 버튼 클릭 시 이동 URL
  },
```

영문은 같은 구조로 `en:` 섹션 안에 있어요.

---

### 📌 핵심 기능 4장 (헤드셋 / 이어버즈 / QR / 풍절음)

찾기: `coreFeatures: {`

각 카드 = `items` 배열의 한 원소:

```ts
{
  icon: 'rabbit-headphones.png',  // ← 토끼 일러스트 파일명 (public/assets/ 안)
  title: '마이크가 있는 블루투스 헤드셋으로 사용',
  body: '가운데 버튼 한 번 톡 누르면 말하기, 다시 누르면 끝. 길게 누를 필요 없어요.',
  note: 'iOS: 한 번 톡 누르면 송신 / 종료. 갤럭시: 송신 시작 1번, 종료 2번.',  // ← 하단 회색 작은 글자
},
```

`note`가 빈 문자열(`''`)이면 카드 하단 회색 메모 영역이 안 보입니다.

---

### 📌 가격 / Pro 시간 변경

찾기: `Pro 구독`

```ts
{
  title: 'Pro 플랜 — 주당 20시간 (출시 예정)',
  body: 'Pro는 월정액 ₩9,900 (출시 예정). 주 20시간 사용. 베타 기간에는 무료로 주 20시간까지 쓰실 수 있어요. 결제는 정식 출시 때 열립니다.',
},
```

FAQ 내 가격 답변도 같이 수정 필요: FAQ `items` 배열에서 `q: '워키토끼는 무료인가요?'` 항목 찾아 `a` 본문 수정.

---

### 📌 FAQ 질문 추가/수정/삭제

찾기: `faq: {`

```ts
faq: {
  heading: '자주 묻는 질문',
  sub: '베타 라이더가 실제로 자주 묻는 질문들을 모았어요.',
  items: [
    {
      q: '워키토끼는 무료인가요?',
      a: '무료 플랜은 주당 3시간까지 송신 가능합니다. 더 길게 쓰시려면...'
    },
    // 새 질문 추가하려면 위와 같은 형식으로 한 블록 더 추가
    {
      q: '새 질문?',
      a: '새 답변입니다.',
    },
  ],
},
```

질문 삭제는 해당 `{ q: ..., a: ... },` 블록 전체를 지우시면 됩니다.

> **순서가 곧 우선순위**: 위쪽에 적힌 질문일수록 더 자주 묻는 것. 첫 번째 질문은 기본적으로 펼쳐진 상태로 표시됩니다.

---

### 📌 회사 주소 / 사업자등록번호 / 이메일

찾기: `footer: {`

```ts
footer: {
  company: '위키드프로덕션',
  brn: '사업자등록번호 248-02-04034',
  address: '서울특별시 강남구 논현로10길 30',   // ← 주소 변경
  email: 'support@walkietokki.com',          // ← 이메일 변경
  ...
},
```

같은 정보가 `/contact` 페이지에도 보입니다. 거기는 별도 파일 `src/pages/contact.astro` 본문에서 수정.

---

### 📌 베타 신청 폼 URL 변경 (Tally 폼 ID 바뀌면)

`src/pages/beta.astro` 파일 안에 Tally iframe URL이 있어요.

찾기: `tally.so/r/`

```html
<iframe src="https://tally.so/r/7RpyVL?transparentBackground=1" ... />
```

여기서 `7RpyVL` 부분만 새 폼 ID로 교체.

---

## 3. 약관 / 개인정보처리방침 수정

- `src/content/ko/terms.md`  ← 약관
- `src/content/ko/privacy.md`  ← 개인정보처리방침

Markdown으로 작성. **"⚠️ 변호사 review 시 확인 요청 포인트"** 같은 내부 메모 섹션은 빌드 시 자동으로 잘려서 사이트에는 안 보입니다.

변호사 자문 받은 뒤 위 두 파일만 수정하시면 똑같이 자동 재배포돼요.

영문 번역본은 v1에서 placeholder (한국어 페이지로 안내). 정식 번역 받으면 `src/pages/en/terms.astro` + `src/pages/en/privacy.astro`도 수정 필요.

---

## 4. 이미지 / 토끼 일러스트 교체

`public/assets/` 폴더에 같은 파일명으로 덮어쓰기 push하시면 끝.

- `walkietokki-hero.png` — 메인 화면 큰 토끼 (1024×1024 권장)
- `rabbit-headphones.png` / `rabbit-airpods.png` / `rabbit-qr.png` / `rabbit-bicycle.png` — 핵심 기능 카드 작은 아이콘 (200×200 정도)
- `og-image.png` — 카톡/페이스북에 링크 미리보기 카드 (1200×630)
- `favicon.ico` / `apple-touch-icon.png` — 브라우저 탭 아이콘

이미지 추가 시 GitHub 웹 에디터로는 못 올리고 (텍스트만 가능), 폴더에서 직접 drag-drop 한 뒤 push해야 합니다. 이 작업은 부탁드리시면 제가 해드릴게요.

---

## 5. 정말 막힐 때 — Claude한테 부탁

```
"카피 어딨어? Pro 가격 ₩9,900 → ₩7,900으로 바꿔줘"
```

위처럼만 말씀해주시면 제가 정확한 라인 찾아 수정 + 빌드 + push까지 다 처리합니다.

---

## 빠른 참조

| 변경 대상 | 파일 |
|---|---|
| 모든 한/영 카피 | `src/i18n/strings.ts` |
| 약관 / 개인정보 | `src/content/ko/terms.md` / `privacy.md` |
| Tally 폼 ID | `src/pages/beta.astro` + `src/pages/en/beta.astro` |
| 이미지 / favicon | `public/assets/`, `public/` |
| 풋터 회사 정보 | `src/i18n/strings.ts` → `footer:` |
| `/contact` 페이지 주소 표기 | `src/pages/contact.astro` + `src/pages/en/contact.astro` |

**기억할 단 하나의 URL:**

```
github.com/0213817-coder/walkietokki-homepage/edit/main/src/i18n/strings.ts
```
