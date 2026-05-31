#!/bin/bash
# 더블클릭하면 변경사항을 GitHub에 push합니다.
# Cloudflare Pages가 push를 감지하면 자동으로 walkietokki.com 재배포 (30~60초).

set -e
cd "$(dirname "$0")"

echo "▶ 워키토끼 홈페이지 → GitHub push 시작"
echo ""

git add -A
git diff --cached --stat | tail -15
echo ""

read -p "위 변경사항을 push할까요? (y/n) " ANSWER
if [ "$ANSWER" != "y" ] && [ "$ANSWER" != "Y" ]; then
  echo "취소됨."
  exit 0
fi

git commit -m "${COMMIT_MSG:-update homepage content}" || echo "(staged 없음 또는 commit 실패)"
git push

echo ""
echo "✅ push 완료. Cloudflare Pages가 30~60초 안에 walkietokki.com 자동 재배포."
read -p "Enter를 누르면 창을 닫을 수 있어요... " _
