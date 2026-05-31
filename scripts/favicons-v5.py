#!/usr/bin/env python3
"""
Favicon v5 — 검정 배경 복귀 + 흰 outline 0건.

Source: public/assets/walkietokki-hero.png
   ← 이미 strip-hero-outline.py 로 흰 outline 제거된 상태
   ← 0% transparent, 검정 사각형 + 토끼 일러스트 + 사운드웨이브

v3/v4 시도가 둘 다 문제:
- v3: 원본 backup(투명 cutout 있지만 흰 outline 있음)을 리사이즈만 → 흰 outline 보임
- v4: dark teal chroma-key 했지만 흰 outline은 색이 달라 살아남음

v5: 흰 outline 처리 끝난 black-bg 버전을 그대로 사용하면 됨.
사이드 효과: 검정 사각형 배경 (Yohan이 다시 원하는 형태)
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SRC = PUBLIC / "assets" / "walkietokki-hero.png"  # cleaned (no white outline)

src = Image.open(SRC).convert("RGBA")
print(f"src: {SRC.name} {src.size}")

# 사이즈별 리사이즈 (LANCZOS 안티알리어스)
src.resize((180, 180), Image.LANCZOS).save(PUBLIC / "apple-touch-icon-v5.png", "PNG", optimize=True)
src.resize((32, 32), Image.LANCZOS).save(PUBLIC / "favicon-32-v5.png", "PNG", optimize=True)
src.resize((16, 16), Image.LANCZOS).save(PUBLIC / "favicon-16-v5.png", "PNG", optimize=True)
src.resize((48, 48), Image.LANCZOS).save(
    PUBLIC / "favicon-v5.ico",
    "ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
)
src.resize((56, 56), Image.LANCZOS).save(PUBLIC / "assets" / "walkietokki-icon-v5.png", "PNG", optimize=True)

print("v5 (검정 배경, 흰 테두리 0) 5종 완료:")
for f in ["apple-touch-icon-v5.png", "favicon-32-v5.png", "favicon-16-v5.png", "favicon-v5.ico"]:
    print(f"  /{f}: {(PUBLIC / f).stat().st_size:,} bytes")
print(f"  /assets/walkietokki-icon-v5.png: {(PUBLIC / 'assets' / 'walkietokki-icon-v5.png').stat().st_size:,} bytes")
