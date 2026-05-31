#!/usr/bin/env python3
"""
Hero 토끼 PNG의 흰색/밝은 외곽 후광(halo) 제거.

문제: 원본은 흰 배경에서 컷팅돼 토끼 실루엣 경계에 anti-alias 흰 픽셀이 남음.
다크 배경(#000) 위에 올리면 토끼 둘레에 옅은 흰 테두리가 보임.

전략 (단계별 누적):
1) 알파 채널을 임계화로 단단히 (50 미만→0, 200 초과→255)
2) **2px erosion**으로 silhouette 자체를 살짝 안쪽으로 줄여서 가장자리 밝은 픽셀 제거
3) 경계(boundary) 픽셀 중 흰색 계열(R/G/B 모두 220 이상)인 것은 알파 0
   → 토끼 본체의 흰 부분이 아닌, 가장자리 잔여 픽셀만 사라짐
"""
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
HERO = ROOT / "public" / "assets" / "walkietokki-hero.png"
BACKUP = ROOT / "public" / "assets" / "walkietokki-hero.original.png"

if not BACKUP.exists():
    HERO.replace(BACKUP)

img = Image.open(BACKUP).convert("RGBA")
arr = np.array(img)
R, G, B, A = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]

# Step 1: 알파 임계화
A1 = np.where(A < 50, 0, np.where(A > 200, 255, A)).astype(np.uint8)

# Step 2: 2px erosion (MinFilter(5) = 반경 2px)
alpha_img = Image.fromarray(A1, mode="L")
alpha_eroded = alpha_img.filter(ImageFilter.MinFilter(5))
A2 = np.array(alpha_eroded)

# Step 3: 새 silhouette의 boundary에서 밝은 흰 픽셀 제거
opaque = A2 > 200
opaque_img = Image.fromarray((opaque.astype("uint8") * 255), mode="L")
# 한 번 더 1px erosion → 차이가 경계 픽셀
inner = np.array(opaque_img.filter(ImageFilter.MinFilter(3))) > 0
boundary = opaque & ~inner

# 경계 픽셀 중 흰 픽셀만 알파 0
white_boundary = boundary & (R > 220) & (G > 220) & (B > 220)
A3 = np.where(white_boundary, 0, A2).astype(np.uint8)

# 추가: 경계의 매우 밝은 픽셀 (>240) 도 제거 (잔여 halo)
very_bright_boundary = boundary & (R > 240) & (G > 240) & (B > 240)
A3 = np.where(very_bright_boundary, 0, A3).astype(np.uint8)

out = Image.fromarray(np.stack([R, G, B, A3], axis=-1).astype(np.uint8), mode="RGBA")
out.save(HERO, "PNG", optimize=True)

# 통계
original = np.array(Image.open(BACKUP).convert("RGBA"))
orig_opaque = (original[..., 3] > 200).sum()
new_opaque = (A3 > 200).sum()
removed = orig_opaque - new_opaque
print(
    f"cleaned: {HERO.stat().st_size:,} bytes "
    f"(was {BACKUP.stat().st_size:,})\n"
    f"silhouette: {orig_opaque:,} → {new_opaque:,} px ({removed:,} edge pixels removed)"
)
