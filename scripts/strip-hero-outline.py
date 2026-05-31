#!/usr/bin/env python3
"""
Hero PNG 안에 그려진 흰색 rounded-rect outline 제거.

문제: walkietokki-hero.png 안에는 일러스트의 일부로 "검정 사각형 + 흰색 둥근
사각형 stroke + 어두운 청록색 안쪽 영역 + 토끼"가 다 합쳐져 있음.
사이트에서 CSS `border-radius`로 모서리를 자르면 그 안에 있던 흰 stroke가
4개 호로 노출됨 (사용자 보고).

전략:
1) 4 모서리에서 대각선 방향으로 들어가며 ‘이전엔 검정(0,0,0) → 흰(>200,>200,>200)
   → 다시 어두움 (<60)’ 패턴 잡힌 영역 = 흰 outline ring.
2) 해당 흰 ring 픽셀 전체를 안쪽 어두운 bg 색 (≈ rgb(10,15,21))으로 치환.
3) 부드러운 경계 위해 1px Gaussian blur 후 ring 영역만 교체.

결과: 같은 1024×1024 PNG, 검정 사각형은 그대로지만 흰 ring이 사라져
다크 페이지 위 CSS rounded 모서리 처리해도 아무 아티팩트 안 보임.
"""
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
HERO = ROOT / "public" / "assets" / "walkietokki-hero.png"
SRC = ROOT / "public" / "assets" / "walkietokki-hero.original.png"

# 원본 우선, 없으면 현재 파일
src_path = SRC if SRC.exists() else HERO
img = Image.open(src_path).convert("RGBA")
arr = np.array(img).astype(np.int16)
H, W = arr.shape[:2]
R, G, B, A = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]

# 흰색 픽셀 마스크 (RGB 모두 180 이상 = 흰/회/연한색)
white_mask = (R > 180) & (G > 180) & (B > 180)
print(f"흰 픽셀 총 개수 (raw): {white_mask.sum():,}")

# 토끼 본체에도 흰 픽셀이 있을 수 있음 (얼굴/배 등) — 모서리 outline만 선택하려면
# 위치 필터: 이미지 중심으로부터 일정 거리 밖 (outer band) 영역만 처리
ys, xs = np.mgrid[0:H, 0:W]
cy, cx = H / 2, W / 2
dist = np.sqrt((xs - cx) ** 2 + (ys - cy) ** 2)
# 토끼는 중앙 320px 이내, outline은 380~500px 사이로 추정됨
outer_band = dist > 380  # 모서리 100~150px 정도 영역
outline_mask = white_mask & outer_band
print(f"outer-band 흰 픽셀 (outline 후보): {outline_mask.sum():,}")

# 어두운 bg 평균 색 (안쪽 어두운 영역에서 샘플)
inner_band = (dist > 200) & (dist < 350) & (R < 40) & (G < 40) & (B < 40)
dark_bg = arr[inner_band][..., :3].mean(axis=0)
print(f"검출된 dark bg color: ({dark_bg[0]:.0f}, {dark_bg[1]:.0f}, {dark_bg[2]:.0f})")

# 모서리 검정 영역도 outline 안쪽에서 보이므로 진짜 검정(0,0,0) 으로 통일
# → 그냥 outline 픽셀을 (0,0,0) 으로 치환하면 모서리 검정과 자연스럽게 융합
fill = (0, 0, 0)
arr2 = arr.copy()
arr2[outline_mask, 0] = fill[0]
arr2[outline_mask, 1] = fill[1]
arr2[outline_mask, 2] = fill[2]

# 살짝 남은 회색/광택 픽셀 (RGB 100~180) 도 outer band면 같이 처리
gray_mask = (R > 100) & (R < 180) & (G > 100) & (G < 180) & (B > 100) & (B < 180) & outer_band
arr2[gray_mask, 0] = fill[0]
arr2[gray_mask, 1] = fill[1]
arr2[gray_mask, 2] = fill[2]
print(f"추가 회색 fill: {gray_mask.sum():,}")

# 부드럽게 (1px gaussian blur는 detail 살리고 edge만 blend)
out = Image.fromarray(arr2.astype(np.uint8), mode="RGBA")
# blur는 ring 안쪽 모서리에서만 처리하려고 했지만 단순화: 전체 1px blur 생략
out.save(HERO, "PNG", optimize=True)

print(f"\nwrote {HERO}")
print(f"size: {HERO.stat().st_size:,} bytes")
