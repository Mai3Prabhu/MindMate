# Meditation Scene Visuals

This directory contains background videos and images for the meditation experience.

## Directory Structure

```
meditation-scenes/
├── nature/
│   ├── bg.jpg           # Fallback still image
│   └── nature.mp4       # Looping video (forest, trees, birds)
├── ocean/
│   ├── bg.jpg           # Fallback still image
│   └── ocean.mp4        # Looping video (waves, beach, seagulls)
├── night/
│   ├── bg.jpg           # Fallback still image
│   └── night.mp4        # Looping video (stars, moon, crickets)
└── README.md
```

## Visual Specifications

### Videos (.mp4)
- **Resolution**: 1920x1080 (Full HD) minimum
- **Format**: MP4 (H.264 codec)
- **Duration**: 30-60 seconds (seamless loop)
- **Frame Rate**: 30 fps
- **Bitrate**: 5-10 Mbps
- **Audio**: Muted (audio comes from separate meditation tracks)
- **Loop**: Must loop seamlessly without visible cuts

### Images (.jpg)
- **Resolution**: 1920x1080 minimum
- **Format**: JPEG
- **Quality**: 85-90%
- **File Size**: < 500 KB (optimized)
- **Purpose**: Fallback for slow connections or video load failures

## Theme Guidelines

### Nature Theme 🌲
- **Visuals**: Forest, trees, sunlight through leaves, gentle breeze
- **Colors**: Greens, browns, soft yellows
- **Mood**: Grounding, peaceful, natural
- **Best for**: Morning, afternoon sessions

### Ocean Theme 🌊
- **Visuals**: Waves, beach, horizon, seagulls, sunset/sunrise
- **Colors**: Blues, teals, soft oranges
- **Mood**: Flowing, rhythmic, expansive
- **Best for**: Afternoon, evening sessions

### Night Theme 🌙
- **Visuals**: Stars, moon, night sky, subtle movement
- **Colors**: Deep blues, purples, blacks, silver
- **Mood**: Calm, deep, restful
- **Best for**: Evening, night sessions

## Creating Seamless Loops

### Video Editing Tips
1. **Start/End Match**: Ensure first and last frames are identical
2. **Motion**: Use slow, continuous motion (no sudden changes)
3. **Crossfade**: Apply 1-2 second crossfade at loop point
4. **Test**: Watch 3-4 loops to verify seamlessness

### Recommended Tools
- **Adobe Premiere Pro**: Professional video editing
- **DaVinci Resolve**: Free, powerful editor
- **FFmpeg**: Command-line video processing
- **Clideo**: Online video looper

## Free Stock Resources

### Video Sources
1. **Pexels Videos**: https://www.pexels.com/videos/
2. **Pixabay Videos**: https://pixabay.com/videos/
3. **Videvo**: https://www.videvo.net/
4. **Coverr**: https://coverr.co/
5. **Mixkit**: https://mixkit.co/

### Search Keywords
- "forest loop"
- "ocean waves loop"
- "night sky timelapse"
- "meditation background"
- "nature ambient"

## Optimization

### Video Compression (FFmpeg)
```bash
# Compress video while maintaining quality
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset slow -vf scale=1920:1080 -an output.mp4

# Create seamless loop
ffmpeg -i input.mp4 -filter_complex "[0:v]split[v0][v1];[v0]trim=0:1[v0t];[v1]trim=1[v1t];[v1t][v0t]concat=n=2:v=1:a=0[outv]" -map "[outv]" output.mp4
```

### Image Optimization
```bash
# Optimize JPEG
convert input.jpg -quality 85 -resize 1920x1080 output.jpg
```

## Implementation

The meditation zone automatically:
1. Loads video with `autoPlay`, `loop`, `muted`, `playsInline`
2. Falls back to static image if video fails to load
3. Applies brightness filter (75%) for better text readability
4. Adds gradient overlay for UI elements

## Performance Tips

1. **Lazy Loading**: Videos load only when meditation zone is accessed
2. **Preload**: Use `poster` attribute with JPG for instant display
3. **CDN**: Host large video files on CDN for faster delivery
4. **Adaptive**: Consider serving different resolutions based on device
5. **Compression**: Balance quality vs file size (aim for < 10 MB per video)

## Accessibility

- Videos are decorative (no critical information)
- Reduced motion: Provide option to disable video and show static image
- Color contrast: Ensure text overlays are readable
- Audio: All audio is separate from video (user-controlled)
