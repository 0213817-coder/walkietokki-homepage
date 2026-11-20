# 비공개 여행 공간 설치

기존 Astro 홈페이지에 `/travel`과 `/travel/api/state`만 추가합니다. 기존 `npm run build` / `dist` 설정을 유지합니다. 실제 여행 날짜, 예약번호, 계정 식별자와 여행 JSON은 이 공개 저장소에 커밋하지 않습니다.

## 한 번 필요한 Cloudflare 설정

1. Cloudflare의 R2에서 비공개 버킷을 생성합니다. 공개 `r2.dev` 및 공개 사용자 도메인을 연결하지 않습니다. R2가 미활성화면 먼저 계정에서 활성화가 필요합니다.
2. Workers & Pages → 기존 홈페이지 Pages 프로젝트 → Settings → Bindings에 R2 바인딩 `TRAVEL_STORE`를 만들고 해당 버킷을 선택합니다. **Production 환경**에 설정합니다. Preview에는 별도 테스트 버킷을 쓰거나 바인딩을 생략하여 차단 상태로 둡니다.
3. Zero Trust → Access controls → Applications → Add application → Self-hosted에서 `walkietokki.com/travel`와 `walkietokki.com/travel/*`를 보호하는 하나의 앱을 만듭니다. `www`에서도 접근하게 하려면 해당 호스트의 같은 경로도 이 앱에 추가합니다. 홈페이지 전체를 보호하지 않도록 경로를 지정합니다. 앱의 AUD는 하나로 유지합니다.
4. 로그인 방법에 One-time PIN 또는 본인이 쓰는 IdP를 설정하고, Allow 정책의 Emails에 **본인이 로그인할 이메일 한 개만** 넣습니다. Everyone / Bypass 정책을 만들지 않습니다.
5. Pages → Settings → Variables and Secrets에 다음 세 문자열을 설정합니다. 클라이언트 공개용 `PUBLIC_` 접두어를 쓰지 않습니다.

| 이름 | 값 |
| --- | --- |
| `TRAVEL_ACCESS_TEAM` | `https://본인의팀이름.cloudflareaccess.com` (끝 `/` 없음) |
| `TRAVEL_ACCESS_AUD` | 위 Access 앱의 Application Audience (AUD) Tag |
| `TRAVEL_OWNER_EMAIL` | 위 Allow 정책과 동일한 로그인 이메일 |

6. 코드 병합 후 Pages가 배포되었는지 확인합니다. 바인딩/변수를 나중에 추가했다면 재배포합니다. 새 DNS 레코드는 필요 없습니다.
7. `https://walkietokki.com/travel`에 로그인합니다. ‘불러오기’로 별도로 전달받은 **개인 여행 JSON**을 선택하고 ‘저장’을 누릅니다. JSON을 GitHub 또는 `public/`에 넣지 않습니다.
8. iPhone Safari에서 같은 주소로 로그인 후 공유 → 홈 화면에 추가합니다. 저장한 내용은 서버에 남아 Mac과 iPhone에서 이어집니다. 네트워크가 필요하며 오프라인 앱은 아닙니다.

설정이 빠졌으면 503, 유효한 본인 로그인 토큰이 없으면 401입니다. 서비스는 데이터를 반환하지 않습니다. Access 경계 밖인 `pages.dev`·preview에서도 서명, 발급자, AUD, 유효시간, 이메일을 직접 검증합니다.

## 배포 후 확인

- 로그아웃/시크릿 창: 로그인 전 여행 내용이 보이지 않는지 확인.
- 본인 이메일: 캘린더·항공권·숙소·충전 체크를 열고 저장.
- 다른 기기: 같은 변경이 로드되는지 확인.
- 두 기기에서 동시에 편집: 오래된 버전의 저장은 409로 거절. 해당 기기에서 백업 후 새로고침.
- `/`, `/download`, `/privacy` 등 기존 홈페이지가 정상인지 확인.
- 설정되지 않은 preview 주소에서 개인 데이터가 노출되지 않는지 확인.
- R2 공개 접근이 꺼져 있는지 확인.

## 계속 수정하는 방법

일정·준비물·노트는 웹에서 직접 편집 후 저장합니다. 새로운 기능/레이아웃은 `travel-app/ui-source.html`을 수정하고 `node scripts/build-travel.mjs`로 `ui.mjs`를 다시 생성합니다. GitHub 병합 → Pages 재배포 후 같은 주소에서 반영됩니다. 앱 코드를 배포해도 R2의 여행 데이터는 덮어쓰지 않습니다.

ChatGPT의 GitHub 연결은 코드 수정을 할 수 있지만, 이 외부 사이트의 로그인된 개인 데이터 저장소에 자동 접근하는 연결은 별도입니다. 여행 데이터 변경은 웹에서 편집하거나 새 JSON을 불러오기·저장하여 반영합니다. 현재 상태의 백업을 먼저 내려받으면 기존 체크 상태와 메모를 보존해 수정할 수 있습니다.

## 검증

`node --test tests/travel.test.mjs`: 실제 RSA 서명 검증, 잘못된 인증 차단, 초기 가져오기, 저장·충돌, 교차 출처 차단, 크기 제한, 데이터 형식과 화면 렌더링.

`npm ci && npm run build`: 기존 Astro 사이트 빌드. PR의 Travel checks에서 실행합니다. Cloudflare 실제 로그인과 휴대폰에서의 동작은 설정 후 별도 확인합니다.

공식 문서:
- https://developers.cloudflare.com/pages/functions/routing/
- https://developers.cloudflare.com/pages/functions/bindings/
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/

### Active implementation and mobile editing

The active travel app remains `/travel` in this repository. Other dashboard prototypes are design references; their data models and deployments are independent and must not be written into this app's R2 state wholesale.

Edits now autosave after a short pause. The browser keeps a private pending draft until an authenticated, version-checked PUT succeeds. On a stale ETag, the client compares its baseline with the latest state, merges edits to different fields and asks the owner to resolve same-field conflicts. Login expiry, connection failures and size limits stay visible with a retry action. Server authentication and conditional writes remain required.

Courses use compact category tables and full-page details. Unverified terrain stays in a collapsed classification queue; no distance-based assumption of flat terrain is made. Original ride dates remain in the historical record details. Mobile calendars show date and ride type; distance remains in the selected-day detail.

Optional private hotel confirmations can be delivered to the owner in a URL fragment containing an AES-GCM payload and its key. Neither payload nor key belongs in source control or public assets. Fragments are not sent in HTTP requests. The client immediately clears the fragment, decrypts locally, verifies every booking reference and date against the owner's existing records, and saves only the confirmation through the protected API. Original booking records remain intact.
