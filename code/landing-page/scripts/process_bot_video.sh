#!/usr/bin/env bash
set -euo pipefail

# Script to process ALVI robot companion / telepresence video:
# 1. Removes green screen using green-excess matte with antialiasing and despill
# 2. Preserves glossy screen, glowing eyes/mouth, video call faces, and white casing
# 3. Scales to 1280x720 lanczos
# 4. Exports transparent WebP frames sequence
# 5. Generates looping animated transparent WebP for fallback/reduced-motion

SRC_VIDEO="bot.mp4"
if [ ! -f "$SRC_VIDEO" ]; then
  echo "Error: Source video $SRC_VIDEO not found!" >&2
  exit 1
fi

OUT_DIR="public/bot_frames"
ANIM_WEBP="public/bot.webp"

mkdir -p "$OUT_DIR"
# Clean previous frames to avoid stale counts
rm -f "$OUT_DIR"/*.webp

echo "=== 1. Extracting transparent WebP frame sequence from $SRC_VIDEO ==="
ffmpeg -y -i "$SRC_VIDEO" \
  -vf "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='clip(255 - 255 * if(gt(g(X,Y),60), (g(X,Y)-max(r(X,Y),b(X,Y))-14)/16, 0), 0, 255)',despill=type=green,scale=1280:-1:flags=lanczos" \
  -vcodec libwebp \
  -lossless 0 -q:v 85 -compression_level 4 \
  "$OUT_DIR/frame_%04d.webp"

TOTAL_FRAMES=$(ls -1 "$OUT_DIR"/*.webp | wc -l)
echo "Total bot frames extracted: $TOTAL_FRAMES"

echo "=== 2. Creating looping animated transparent WebP (720p) ==="
ffmpeg -y -i "$SRC_VIDEO" \
  -vf "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='clip(255 - 255 * if(gt(g(X,Y),60), (g(X,Y)-max(r(X,Y),b(X,Y))-14)/16, 0), 0, 255)',despill=type=green,scale=1280:-1:flags=lanczos,fps=16" \
  -vcodec libwebp \
  -lossless 0 -q:v 80 -compression_level 4 \
  -loop 0 \
  "$ANIM_WEBP"

echo "=== Done! Robot assets created: ==="
ls -lh "$ANIM_WEBP"
echo "Frames in $OUT_DIR: $TOTAL_FRAMES"
