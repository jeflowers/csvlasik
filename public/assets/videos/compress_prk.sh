ffmpeg -i "PRK-Treatment-Animation.mp4" \
  -c:v libx264 \
  -crf 26 \
  -preset slow \
  -vf "scale=1920:-2" \
  -c:a aac \
  -b:a 96k \
  -movflags +faststart \
  "PRK-Treatment-Animation_optimized.mp4"
