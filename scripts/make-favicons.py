#!/usr/bin/env python3
"""favicon + apple-touch-icon 생성."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
ICON = PUBLIC / "assets" / "walkietokki-icon.png"

src = Image.open(ICON).convert("RGBA")

# apple-touch-icon (180x180)
src.resize((180, 180), Image.LANCZOS).save(PUBLIC / "apple-touch-icon.png", "PNG")

# favicon-32
src.resize((32, 32), Image.LANCZOS).save(PUBLIC / "favicon-32.png", "PNG")

# favicon-16
src.resize((16, 16), Image.LANCZOS).save(PUBLIC / "favicon-16.png", "PNG")

# favicon.ico (multi-size)
src.resize((48, 48), Image.LANCZOS).save(
    PUBLIC / "favicon.ico",
    "ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
)

print("favicons written.")
