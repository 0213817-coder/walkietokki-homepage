# walkietokki-homepage

워키토끼(walkietokki.com) 공식 홈페이지.

## 기술 스택

- **Astro 4** + TypeScript
- **Tailwind CSS** (다크 only)
- **i18n**: 한국어(`/`) + 영어(`/en/`)
- 호스팅: **Cloudflare Pages**

## 개발

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # dist/ 생성
npm run preview      # 빌드 결과 미리보기
```

Node 20+ 필요.

## 배포

GitHub `main` 푸시 → Cloudflare Pages 자동 빌드/배포.

- Build command: `npm run build`
- Build output: `dist`
- Node version: `20`
- Custom domain: `walkietokki.com`

## 페이지 (한 8 + 영 8 = 16)

| 경로 | 내용 |
| --- | --- |
| `/` | 메인 (한국어) |
| `/terms` | 서비스 이용약관 |
| `/privacy` | 개인정보처리방침 |
| `/licenses` | 오픈소스 라이선스 |
| `/contact` | 문의 |
| `/beta` | 베타 신청 (Tally 폼) |
| `/download` | 다운로드 (TestFlight 안내) |
| `/reviews` | 베타 라이더 후기 (v1: placeholder) |
| `/en/...` | 위 8개의 영문 버전 |

## 자산 출처

`public/assets/` 안의 토끼 PNG들은 iOS 앱(`~/Documents/CycloTalk/CycloTalk/Assets.xcassets`)에서 복사한 자산입니다.

## 콘텐츠 수정

- 약관/개인정보: `src/content/ko/terms.md`, `src/content/ko/privacy.md`
- 영문 약관/개인정보 v1: "Coming soon" placeholder

변호사 자문 후 위 .md만 수정하면 자동 재배포됩니다.
