#!/usr/bin/env python3
"""
Favicon source(walkietokki-icon.png) 의 흰 outline 제거 후
apple-touch-icon, favicon-16/32, favicon.ico 모두 v2 파일로 재생성.

기존 파일은 그대로 둠 (외부 캐시 안전망).
"""
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SRC = PUBLIC / "assets" / "walkietokki-icon.png"

img = Image.open(SRC).convert("RGBA")
arr = np.array(img).astype(np.int16)
H, W = arr.shape[:2]
R, G, B, A = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]

# 중심 기준 outer band 흰 픽셀 검정 처리 (hero 와 동일 로직)
ys, xs = np.mgrid[0:H, 0:W]
cy, cx = H / 2, W / 2
dist = np.sqrt((xs - cx) ** 2 + (ys - cy) ** 2)

outer_band = dist > (min(H, W) * 0.37)
white_mask = (R > 180) & (G > 180) & (B > 180) & outer_band
gray_mask = (R > 100) & (R < 180) & (G > 100) & (G < 180) & (B > 100) & (B < 180) & outer_band

arr2 = arr.copy()
arr2[white_mask, 0:3] = 0
arr2[gray_mask, 0:3] = 0
print(f"흰 outline {white_mask.sum():,} + 회색 {gray_mask.sum():,} 픽셀 검정 처리")

cleaned = Image.fromarray(arr2.astype(np.uint8), mode="RGBA")

# 생성: v2 suffix 로
cleaned.resize((180, 180), Image.LANCZOS).save(PUBLIC / "apple-touch-icon-v2.png", "PNG")
cleaned.resize((32, 32), Image.LANCZOS).save(PUBLIC / "favicon-32-v2.png", "PNG")
cleaned.resize((16, 16), Image.LANCZOS).save(PUBLIC / "favicon-16-v2.png", "PNG")
cleaned.resize((48, 48), Image.LANCZOS).save(
    PUBLIC / "favicon-v2.ico",
    "ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
)
print("favicon-v2 4종 작성 완료.")
