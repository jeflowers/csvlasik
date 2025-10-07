#!/bin/bash
/**
 * @file trim_charles_video.sh
 * @description Trim video to start at 7.4s and end at 1:38
 * @author Development
 * @filepath csvlasik/public/assets/videos/trim_charles_video.sh
 * @category Script
 * @version 1.0.0
 * @last_updated 2025-10-07
 */

INPUT="Charles-W-Flowers-Jr-MD.mp4"
OUTPUT="Charles-W-Flowers-Jr-MD_trimmed_fandb.mp4"

# Define start and end points
START_TIME=7.4           # Start at 7.40 seconds
END_TIME=99.25           # End at 1:39 (1 minute 39 seconds = 99 seconds)

# Calculate duration to keep
TRIM_DURATION=$(echo "$END_TIME - $START_TIME" | bc)

echo "🎬 Video Trimmer"
echo "─────────────────────────────────"
echo "Start time: $START_TIME seconds (00:00:07.40)"
echo "End time: $END_TIME seconds (00:01:38)"
echo "Duration to keep: $TRIM_DURATION seconds"
echo ""
echo "✂️  Trimming video..."

# Trim video
ffmpeg -ss $START_TIME \
  -i "$INPUT" \
  -t $TRIM_DURATION \
  -c:v libx264 \
  -crf 23 \
  -preset medium \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  -y \
  "$OUTPUT"

echo ""
echo "✅ Done! Output: $OUTPUT"
echo "─────────────────────────────────"
ls -lh "$OUTPUT"
