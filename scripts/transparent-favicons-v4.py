#!/usr/bin/env python3
"""
Favicon v4 — 청록 배경까지 chroma-key 처리해 진짜 토끼만 floating.

v3: 원본 hero (둥근 사각형 cutout) 그대로 → 안쪽 어두운 청록 bg(rgb≈11,17,21)가
남아있어 작은 사이즈에선 둥근 사각형 윤곽이 살짝 보임.

v4: 안쪽 청록 영역도 alpha 0 처리.
- RGB 모두 < 40 (어두운 텔/검정) → 투명
- 단, 토끼/사운드웨이브/워키토키의 진한 검은 음영(예: 헤드셋, 안테나 등)은 보존해야 함
  → 거리 기반 filter: 외곽 60% 영역의 어두운 픽셀만 처리, 중앙 40%는 그대로
"""
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SRC = PUBLIC / "assets" / "walkietokki-hero.original.png"

img = Image.open(SRC).convert("RGBA")
arr = np.array(img).astype(np.int16)
H, W = arr.shape[:2]
R, G, B, A = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
print(f"src: {img.size}, opaque={(A > 200).sum():,}")

# 거리 기반 마스크: 중심에서 일정 반경 밖의 어두운 픽셀만 처리
ys, xs = np.mgrid[0:H, 0:W]
cy, cx = H / 2, W / 2
dist = np.sqrt((xs - cx) ** 2 + (ys - cy) ** 2)
max_r = min(H, W) / 2

# 중심에서 65% 이상 떨어진 (외곽 35%) 영역의 어두운 픽셀만 투명 처리
outer_band = dist > (max_r * 0.65)
# 텔/검정 (R/G/B 모두 < 50, 즉 dark teal/black)
dark = (R < 50) & (G < 50) & (B < 50)
chroma_mask = outer_band & dark & (A > 200)
print(f"chroma-key 대상 (외곽 어두운 픽셀): {chroma_mask.sum():,}")

A2 = np.where(chroma_mask, 0, A).astype(np.uint8)

# 좀 더 자연스럽게: 토끼 silhouette 가장자리 안티알리어스 살리기 위해
# 0~30 사이 알파는 0, 30~200은 그대로 (이미 작은 영역이라 큰 문제 X)

cleaned = Image.fromarray(np.stack([R, G, B, A2], axis=-1).astype(np.uint8), mode="RGBA")
opaque_after = (A2 > 200).sum()
print(f"opaque after: {opaque_after:,}")

# v4 파일 생성
cleaned.resize((180, 180), Image.LANCZOS).save(PUBLIC / "apple-touch-icon-v4.png", "PNG", optimize=True)
cleaned.resize((32, 32), Image.LANCZOS).save(PUBLIC / "favicon-32-v4.png", "PNG", optimize=True)
cleaned.resize((16, 16), Image.LANCZOS).save(PUBLIC / "favicon-16-v4.png", "PNG", optimize=True)
cleaned.resize((48, 48), Image.LANCZOS).save(
    PUBLIC / "favicon-v4.ico",
    "ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
)
cleaned.resize((56, 56), Image.LANCZOS).save(PUBLIC / "assets" / "walkietokki-icon-v4.png", "PNG", optimize=True)

print("\nv4 (진짜 투명) 5종 완료:")
for f in ["apple-touch-icon-v4.png", "favicon-32-v4.png", "favicon-16-v4.png", "favicon-v4.ico"]:
    print(f"  /{f}: {(PUBLIC / f).stat().st_size:,} bytes")
print(f"  /assets/walkietokki-icon-v4.png: {(PUBLIC / 'assets' / 'walkietokki-icon-v4.png').stat().st_size:,} bytes")
