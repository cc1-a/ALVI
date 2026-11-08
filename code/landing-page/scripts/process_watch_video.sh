#!/usr/bin/env bash
set -euo pipefail

# Script to process watch video: remove greenscreen, lower frame rate, and output transparent WebP assets.

SRC_VIDEO="watch.mp4"
if [ ! -f "$SRC_VIDEO" ] && [ -f "watch video.mp4" ]; then
  SRC_VIDEO="watch video.mp4"
fi

FPS=12
OUT_DIR="public/watch_frames"
ANIM_WEBP="public/watch.webp"
ANIM_WEBP_720P="public/watch_720p.webp"

mkdir -p "$OUT_DIR"

echo "=== 1. Extracting transparent WebP frame sequence at ${FPS} fps ==="
ffmpeg -y -i "$SRC_VIDEO" \
  -vf "colorkey=0x12AB28:0.08:0.04,fps=${FPS}" \
  -vcodec libwebp \
  -lossless 0 -q:v 85 -compression_level 4 \
  "$OUT_DIR/frame_%04d.webp"

echo "=== 2. Creating animated transparent WebP (1080p) ==="
ffmpeg -y -i "$SRC_VIDEO" \
  -vf "colorkey=0x12AB28:0.08:0.04,fps=${FPS}" \
  -vcodec libwebp \
  -lossless 0 -q:v 80 -compression_level 4 \
  -loop 0 \
  "$ANIM_WEBP"

echo "=== 3. Creating optimized animated transparent WebP (720p) ==="
ffmpeg -y -i "$SRC_VIDEO" \
  -vf "colorkey=0x12AB28:0.08:0.04,fps=${FPS},scale=1280:-1:flags=lanczos" \
  -vcodec libwebp \
  -lossless 0 -q:v 80 -compression_level 4 \
  -loop 0 \
  "$ANIM_WEBP_720P"

echo "=== Done! Assets created: ==="
ls -lh "$ANIM_WEBP" "$ANIM_WEBP_720P"
echo "Frames extracted to $OUT_DIR (Total frames: $(ls -1 "$OUT_DIR"/*.webp | wc -l))"
