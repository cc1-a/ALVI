#!/usr/bin/env bash
set -euo pipefail

# Script to process pill dispenser video:
# Upscaled to full native 1080p (1920x1080) with high-fidelity sharpening & WebP quality 92.
# Removes green screen using green-excess matte with antialiasing and despill.

SRC_VIDEO="pill.mp4"
if [ ! -f "$SRC_VIDEO" ]; then
  echo "Error: Source video $SRC_VIDEO not found!" >&2
  exit 1
fi

OUT_DIR="public/dispenser_frames"
ANIM_WEBP="public/dispenser_720p.webp"

mkdir -p "$OUT_DIR"
rm -f "$OUT_DIR"/*.webp

echo "=== 1. Extracting high-res 1080p transparent WebP sequence (1920x1080) ==="
ffmpeg -y -i "$SRC_VIDEO" \
  -vf "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='clip(255 - 255 * if(gt(g(X,Y),70), (g(X,Y)-max(r(X,Y),b(X,Y))-18)/18, 0), 0, 255)',despill=type=green,unsharp=3:3:0.5:3:3:0.0" \
  -vcodec libwebp \
  -lossless 0 -q:v 92 -compression_level 4 \
  "$OUT_DIR/frame_%04d.webp"

TOTAL_FRAMES=$(ls -1 "$OUT_DIR"/*.webp | wc -l)
echo "Total 1080p dispenser frames extracted: $TOTAL_FRAMES"

echo "=== 2. Creating looping animated transparent WebP ==="
ffmpeg -y -i "$SRC_VIDEO" \
  -vf "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='clip(255 - 255 * if(gt(g(X,Y),70), (g(X,Y)-max(r(X,Y),b(X,Y))-18)/18, 0), 0, 255)',despill=type=green,scale=1280:-1:flags=lanczos,fps=20" \
  -vcodec libwebp \
  -lossless 0 -q:v 82 -compression_level 4 \
  -loop 0 \
  "$ANIM_WEBP"

echo "=== Done! High-res dispenser assets created: ==="
ls -lh "$ANIM_WEBP"
echo "Frames in $OUT_DIR: $TOTAL_FRAMES"
ls -lh "$OUT_DIR"/frame_0001.webp "$OUT_DIR"/frame_0035.webp
