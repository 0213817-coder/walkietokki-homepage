#!/usr/bin/env python3
"""1200x630 OG/Twitter card 합성. public/assets/og-image.png 생성."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "public" / "assets"
HERO = ASSETS / "walkietokki-hero.png"
OUT = ASSETS / "og-image.png"

W, H = 1200, 630
BG = (0, 0, 0)

img = Image.new("RGB", (W, H), BG)

# Hero (좌측 중앙 480x480)
hero = Image.open(HERO).convert("RGBA")
hero_w, hero_h = 480, 480
hero = hero.resize((hero_w, hero_h), Image.LANCZOS)
hero_x = 80
hero_y = (H - hero_h) // 2
img.paste(hero, (hero_x, hero_y), hero)

# Text (우측)
draw = ImageDraw.Draw(img)


def find_font(candidates, size):
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


KR_CANDIDATES = [
    "/System/Library/Fonts/AppleSDGothicNeo.ttc",
    "/System/Library/Fonts/Supplemental/AppleSDGothicNeo.ttc",
    "/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]
EN_CANDIDATES = [
    "/System/Library/Fonts/Helvetica.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]

title_font = find_font(KR_CANDIDATES, 72)
sub_font = find_font(EN_CANDIDATES, 32)

title = "워키토끼"
sub = "자전거 친구와 실시간 무전"

tx = 620
ty = 240
draw.text((tx, ty), title, font=title_font, fill=(255, 255, 255))
draw.text((tx, ty + 110), sub, font=sub_font, fill=(255, 255, 255, 160))

img.save(OUT, "PNG", optimize=True)
print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")
