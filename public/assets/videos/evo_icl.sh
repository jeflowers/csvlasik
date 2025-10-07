ffmpeg -ss 00:00:03 \
  -i "EVO-Visian-ICL-Procedure-Animation.mp4" \
  -c:v libx264 \
  -crf 23 \
  -preset medium \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  "EVO-Visian-ICL-Procedure-Animation_trimmed.mp4"
