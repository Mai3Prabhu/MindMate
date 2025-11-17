# Focus Mode Environment Images

Background images for different times of day in Focus Mode.

## Directory Structure

```
focus-environments/
├── forest/
│   ├── forest-morning.jpg   # Dawn/sunrise forest scene
│   ├── forest-day.jpg       # Bright daylight forest
│   └── forest-evening.jpg   # Sunset/dusk forest scene
└── README.md
```

## Image Specifications

### Technical Requirements
- **Resolution**: 1920x1080 minimum (Full HD)
- **Format**: JPEG (.jpg)
- **Quality**: 85-90% compression
- **File Size**: < 800 KB each (optimized for web)
- **Aspect Ratio**: 16:9 (landscape)

### Visual Guidelines

#### Morning Forest (forest-morning.jpg) 🌅
- **Time**: Dawn, early morning (6-9 AM feel)
- **Lighting**: Soft, warm golden light filtering through trees
- **Colors**: Warm yellows, soft greens, gentle oranges
- **Mood**: Fresh, hopeful, energizing
- **Elements**: Sunbeams, morning mist, dew on leaves

#### Day Forest (forest-day.jpg) ☀️
- **Time**: Midday, bright daylight (10 AM - 4 PM feel)
- **Lighting**: Bright, clear natural light
- **Colors**: Vibrant greens, clear blues, natural browns
- **Mood**: Alert, focused, vibrant
- **Elements**: Clear sky through canopy, bright foliage

#### Evening Forest (forest-evening.jpg) 🌆
- **Time**: Sunset, dusk (5-8 PM feel)
- **Lighting**: Warm, golden hour light
- **Colors**: Deep oranges, purples, rich greens
- **Mood**: Calm, reflective, winding down
- **Elements**: Sunset glow, longer shadows, peaceful atmosphere

## Free Stock Resources

### Recommended Sites
1. **Unsplash**: https://unsplash.com/
   - Search: "forest morning", "forest daylight", "forest sunset"
2. **Pexels**: https://www.pexels.com/
   - High-quality nature photography
3. **Pixabay**: https://pixabay.com/
   - Free forest and nature images
4. **Freepik**: https://www.freepik.com/
   - Professional nature photography

### Search Keywords
- "forest morning light"
- "sunbeams through trees"
- "bright forest daylight"
- "forest sunset golden hour"
- "peaceful forest scene"
- "nature background"

## Image Optimization

### Using ImageOptim (Mac) or TinyPNG
1. Download high-resolution forest images
2. Resize to 1920x1080 if needed
3. Compress to 85-90% quality
4. Ensure file size < 800 KB

### Command Line (ImageMagick)
```bash
# Resize and optimize
convert input.jpg -resize 1920x1080^ -gravity center -extent 1920x1080 -quality 85 output.jpg
```

## Usage in Focus Mode

The Focus Mode automatically selects the appropriate forest image based on session duration:
- **15-60 minutes**: Morning forest (energizing start)
- **60-120 minutes**: Day forest (sustained focus)
- **120+ minutes**: Evening forest (deep, extended focus)

## Design Considerations

1. **Text Readability**: Images should work well with white text overlays
2. **Gradient Overlay**: App applies dark gradient for better UI visibility
3. **Mood Matching**: Each image should support the intended focus duration
4. **Consistency**: All images should feel cohesive as a set
5. **Performance**: Optimized file sizes for fast loading

## Quick Setup

1. Find 3 forest images matching the time-of-day descriptions
2. Resize to 1920x1080 and optimize
3. Rename to: `forest-morning.jpg`, `forest-day.jpg`, `forest-evening.jpg`
4. Place in `frontend/public/focus-environments/forest/`
5. Test in Focus Mode with different durations!

The Focus Mode will automatically display the appropriate forest scene based on your session length.