ffmpeg -i "Do-I-Need-LASIK.mp4" \
  -c:v libx264 \
  -crf 24 \
  -preset slow \
  -vf "scale=1920:-2" \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  "Do-I-Need-LASIK_optimized.mp4"
