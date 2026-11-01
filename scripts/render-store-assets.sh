#!/usr/bin/env bash
# Renders icons from assets/logo.svg and store images from store/src/*.html.
# Needs rsvg-convert (brew install librsvg) and Google Chrome.
set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

for size in 16 32 48 128; do
  rsvg-convert -w "$size" -h "$size" assets/logo.svg -o "images/logo-$size.png"
done

# Headless Chrome can exit non-zero after writing the screenshot, so check the file instead.
render() {
  rm -f "$3"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --allow-file-access-from-files --window-size="$2" --screenshot="$PWD/$3" "file://$PWD/$1" 2>/dev/null || true
  [[ -s "$3" ]] || { echo "Rendering $1 failed" >&2; exit 1; }
}

render store/src/screenshot-1.html 1280,800 store/screenshots/screenshot-1.png
render store/src/screenshot-2.html 1280,800 store/screenshots/screenshot-2.png
render store/src/promo-tile.html 440,280 store/promo-tile-440x280.png
cp images/logo-128.png store/icon-128.png
