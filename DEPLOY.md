# 배포 가이드

워키토끼 공식 홈페이지를 walkietokki.com 도메인까지 띄우는 단계별 안내.

---

## 1. 로컬에서 한 번 빌드 확인

```bash
cd ~/Documents/walkietokki-homepage
npm install          # 처음 1회만
npm run dev          # http://localhost:4321 에서 확인
```

종료는 `Ctrl + C`.

빌드 미리보기:

```bash
npm run build
npm run preview      # dist/ 결과를 그대로 서빙
```

> 비유: 로컬은 "리허설". Cloudflare Pages는 "본 공연 무대".

---

## 2. GitHub 레포 만들고 push

### 2-1. 빈 레포 만들기 (브라우저)

1. https://github.com/new 접속 (`Cmd + L` → 주소창 → 위 URL)
2. Owner: `0213817-coder`
3. Repository name: **walkietokki-homepage**
4. Visibility: **Public** (Cloudflare Pages 무료 플랜과 잘 맞음)
5. **README/`.gitignore`/license 모두 체크 해제** (이미 로컬에 있음)
6. **Create repository** 클릭

### 2-2. 로컬에서 첫 push

터미널 (`Cmd + Space` → "Terminal"):

```bash
cd ~/Documents/walkietokki-homepage
git init
git add .
git commit -m "Initial commit: walkietokki.com homepage v1"
git branch -M main
git remote add origin https://github.com/0213817-coder/walkietokki-homepage.git
git push -u origin main
```

비밀번호 대신 **Personal Access Token**을 물어보면, https://github.com/settings/tokens/new 에서 `repo` 스코프로 토큰 발급 → 그걸 비밀번호 자리에 붙여넣기.

---

## 3. Cloudflare Pages 연결

### 3-1. Pages 프로젝트 만들기

1. https://dash.cloudflare.com/ 접속
2. 좌측 메뉴 **Workers & Pages** → **Create application** → **Pages** 탭
3. **Connect to Git** 클릭
4. GitHub 계정 연결 → `walkietokki-homepage` 레포 선택 → **Begin setup**

### 3-2. 빌드 설정

| 항목 | 값 |
| --- | --- |
| Project name | `walkietokki-homepage` |
| Production branch | `main` |
| Framework preset | **Astro** |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (비워둠) |
| Environment variables | `NODE_VERSION` = `20` |

**Save and Deploy** → 1~2분 빌드 → 임시 URL `walkietokki-homepage.pages.dev` 발급.

> 비유: GitHub 푸시는 "원고 마감", Cloudflare 자동 빌드는 "출판사 인쇄".
> 다음부턴 `git push`만 하면 자동으로 새 글이 인쇄돼서 walkietokki.com에 올라갑니다.

---

## 4. walkietokki.com 도메인 연결

1. Pages 프로젝트 화면 → 상단 **Custom domains** 탭
2. **Set up a custom domain** → `walkietokki.com` 입력 → **Continue**
3. Cloudflare가 같은 계정 DNS면 자동으로 CNAME 등록. 1~2분 대기.
4. `www.walkietokki.com`도 같은 방식으로 추가 (선택)
5. SSL은 Universal 인증서가 자동 발급됨 (수 분 소요)

확인:

```bash
curl -I https://walkietokki.com
# HTTP/2 200 이어야 정상
```

---

## 5. App Store Connect에 개인정보 URL 등록

`https://walkietokki.com/privacy` ← 이 URL을 App Store Connect → 앱 정보 → 개인정보 처리방침 URL에 입력.

---

## 6. placeholder 채우는 방법

`src/content/ko/terms.md` 와 `src/content/ko/privacy.md` 안에 다음 4개 부분이 비어 있습니다:

| placeholder | 어디서 채우나 |
| --- | --- |
| `[대표자 성명 — 기입 필요]` | 사업자등록증의 대표자 성명 |
| `[코워크시티 강남구 직영점 비상주 사무실 주소 — 기입 필요]` | 코워크시티에서 발급받은 실제 등기 주소 |
| `[성명 / 이메일 — 기입 필요]` (개인정보 보호책임자) | Yohan 본인 이름 + `support@walkietokki.com` 또는 별도 이메일 |
| `2026-XX-XX (정식 출시일)` 시행일 | 정식 출시일 (예: `2026-06-15`) |

수정 흐름:

```bash
# 1. 에디터로 파일 열기
open -a "TextEdit" ~/Documents/walkietokki-homepage/src/content/ko/terms.md
# 또는 VS Code: code ~/Documents/walkietokki-homepage/src/content/ko/

# 2. placeholder 4개 찾아서 실제 값으로 교체

# 3. commit + push
cd ~/Documents/walkietokki-homepage
git add src/content/ko/
git commit -m "Fill in legal placeholders"
git push
```

→ Cloudflare가 자동으로 1~2분 뒤 재배포. walkietokki.com에 즉시 반영.

---

## 7. 변호사 검토 받은 뒤

`docs/legal/*.md`(원본)와 `src/content/ko/*.md`(홈페이지용 복사본)는 분리되어 있습니다.
변호사 review 후 수정된 .md를 받으면:

```bash
cp ~/Documents/CycloTalk/docs/legal/terms-of-service-draft.md \
   ~/Documents/walkietokki-homepage/src/content/ko/terms.md

cp ~/Documents/CycloTalk/docs/legal/privacy-policy-draft.md \
   ~/Documents/walkietokki-homepage/src/content/ko/privacy.md

cd ~/Documents/walkietokki-homepage
git add src/content/ko/
git commit -m "Sync legal docs from CycloTalk repo (lawyer-reviewed)"
git push
```

내부 메모 섹션(`⚠️ 변호사 review`, `✏️ 게시 전`)은 빌드 시 자동으로 잘려서 외부에 노출되지 않습니다.

---

## 8. 16개 URL 체크리스트

배포 후 한 번씩 눌러보세요.

| 한국어 | 영어 |
| --- | --- |
| `/` | `/en/` |
| `/beta` | `/en/beta` |
| `/download` | `/en/download` |
| `/reviews` | `/en/reviews` |
| `/terms` | `/en/terms` |
| `/privacy` | `/en/privacy` |
| `/licenses` | `/en/licenses` |
| `/contact` | `/en/contact` |

404 테스트: 일부러 `/random` 같은 주소를 쳐서 404 페이지가 다크 톤으로 나오는지 확인.

---

## 9. 자주 쓰는 단축키

| 단축키 | 동작 |
| --- | --- |
| `Cmd + R` | 브라우저 새로고침 |
| `Cmd + Shift + R` | 캐시 무시 새로고침 (배포 직후 확인) |
| `Cmd + Option + I` | DevTools 열기 (모바일 미리보기 가능) |
| `Cmd + L` | 브라우저 주소창 포커스 |
| `Ctrl + C` | `npm run dev` 종료 |

---

## 문제 발생 시

- 빌드 실패: `npm run build` 출력의 에러 메시지 그대로 캡처해서 Yohan에게 전달
- 도메인 연결 안 됨: Cloudflare DNS 탭에서 `walkietokki.com` CNAME이 `walkietokki-homepage.pages.dev`를 가리키는지 확인
- 페이지 변경이 안 보임: `Cmd + Shift + R` (캐시 무시 새로고침)
