ffmpeg -i "Do-I-Need-LASIK.mp4" \
  -t 135 \
  -vf "fade=t=out:st=131:d=4" \
  -af "afade=t=out:st=131:d=4" \
  -c:v libx264 \
  -crf 24 \
  -preset slow \
  -vf "scale='min(1920,iw)':'-2',fade=t=out:st=131:d=4" \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  "Do-I-Need-LASIK_final.mp4"
