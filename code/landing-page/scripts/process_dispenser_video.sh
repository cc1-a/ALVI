#!/usr/bin/env bash
set -euo pipefail

# Script to process pill dispenser video:
# 1. Cuts from 00:00:02 to 00:00:05 (3 seconds duration)
# 2. Removes chroma green screen (0x398e4d) with despill filter
# 3. Scales to 1280x720 lanczos for ultra-crisp resolution
# 4. Exports 72 transparent WebP frames at 24fps
# 5. Generates looping animated transparent WebP for fallback/reduced-motion

SRC_VIDEO="Hand_receiving_pills_from_dispenser_c15daba2_1080p.mp4"
if [ ! -f "$SRC_VIDEO" ]; then
  echo "Error: Source video $SRC_VIDEO not found!" >&2
  exit 1
fi

FPS=24
OUT_DIR="public/dispenser_frames"
ANIM_WEBP_720P="public/dispenser_720p.webp"

mkdir -p "$OUT_DIR"

echo "=== 1. Extracting transparent WebP frame sequence (2s - 5s at ${FPS} fps) ==="
ffmpeg -y -ss 00:00:02 -t 3 -i "$SRC_VIDEO" \
  -vf "colorkey=0x398e4d:0.20:0.04,despill=type=green,scale=1280:-1:flags=lanczos,fps=${FPS}" \
  -vcodec libwebp \
  -lossless 0 -q:v 85 -compression_level 4 \
  "$OUT_DIR/frame_%04d.webp"

echo "=== 2. Creating optimized looping animated transparent WebP (720p) ==="
ffmpeg -y -ss 00:00:02 -t 3 -i "$SRC_VIDEO" \
  -vf "colorkey=0x398e4d:0.20:0.04,despill=type=green,scale=1280:-1:flags=lanczos,fps=16" \
  -vcodec libwebp \
  -lossless 0 -q:v 80 -compression_level 4 \
  -loop 0 \
  "$ANIM_WEBP_720P"

echo "=== Done! Assets created: ==="
echo "Total frames extracted: $(ls -1 "$OUT_DIR"/*.webp | wc -l)"
ls -lh "$ANIM_WEBP_720P"
