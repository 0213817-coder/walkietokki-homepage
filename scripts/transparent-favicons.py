#!/usr/bin/env python3
"""
Favicon v3 — 투명 배경 버전.

원본 hero (walkietokki-hero.original.png, 53% transparent) 를 그대로 리사이즈해서
검정 사각형 없이 토끼 + 일러스트 부분만 보이는 favicon 생성.

v2 (검정 사각형) 와 별도 파일로 만들어서 기존 안전망 유지.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

# 원본 hero (53% 투명 둥근 모서리 컷아웃 버전)
SRC = PUBLIC / "assets" / "walkietokki-hero.original.png"
if not SRC.exists():
    # fallback: AppIcon (이건 0% transparent 이므로 비추)
    SRC = PUBLIC / "assets" / "walkietokki-hero.png"

src = Image.open(SRC).convert("RGBA")
print(f"src: {SRC.name} {src.size}")

# 안티알리어스 좋게 LANCZOS 다운샘플
src.resize((180, 180), Image.LANCZOS).save(PUBLIC / "apple-touch-icon-v3.png", "PNG", optimize=True)
src.resize((32, 32), Image.LANCZOS).save(PUBLIC / "favicon-32-v3.png", "PNG", optimize=True)
src.resize((16, 16), Image.LANCZOS).save(PUBLIC / "favicon-16-v3.png", "PNG", optimize=True)
src.resize((48, 48), Image.LANCZOS).save(
    PUBLIC / "favicon-v3.ico",
    "ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
)

# 헤더 좌상단 워키토끼 로고용 (32×32 around)
src.resize((56, 56), Image.LANCZOS).save(PUBLIC / "assets" / "walkietokki-icon-v3.png", "PNG", optimize=True)

print("favicon v3 (transparent) 4종 + header icon 작성 완료.")
for f in ["apple-touch-icon-v3.png", "favicon-32-v3.png", "favicon-16-v3.png", "favicon-v3.ico"]:
    p = PUBLIC / f
    print(f"  {f}: {p.stat().st_size:,} bytes")
print(f"  assets/walkietokki-icon-v3.png: {(PUBLIC / 'assets' / 'walkietokki-icon-v3.png').stat().st_size:,} bytes")
