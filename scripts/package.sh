#!/usr/bin/env bash
# Builds the zip to upload to the Chrome Web Store developer dashboard.
set -euo pipefail
cd "$(dirname "$0")/.."

version=$(node -p 'require("./manifest.json").version')
out="dist/kleinanzeigen-pusher-$version.zip"

mkdir -p dist
rm -f "$out"
zip -qr "$out" manifest.json src images -x '.*'
echo "$out"
