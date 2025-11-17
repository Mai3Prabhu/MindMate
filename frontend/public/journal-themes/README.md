# Journal Theme Assets

Visual assets for different journal themes and moods.

## Directory Structure

```
journal-themes/
├── backgrounds/
│   ├── calm.jpg         # Soft, peaceful background
│   ├── energetic.jpg    # Vibrant, motivating background
│   ├── reflective.jpg   # Deep, contemplative background
│   └── creative.jpg     # Inspiring, artistic background
├── icons/
│   ├── mood-happy.svg   # Happy face icon
│   ├── mood-sad.svg     # Sad face icon
│   ├── mood-calm.svg    # Peaceful face icon
│   ├── mood-excited.svg # Excited face icon
│   └── mood-anxious.svg # Worried face icon
└── README.md
```

## Background Images

### Technical Specifications
- **Resolution**: 1920x1080 minimum
- **Format**: JPEG (.jpg)
- **Quality**: 80-85% compression
- **File Size**: < 600 KB each
- **Aspect Ratio**: 16:9
- **Opacity**: Will be used at 20-30% opacity as subtle backgrounds

### Theme Guidelines

#### Calm Theme (calm.jpg) 🌸
- **Colors**: Soft pastels, light blues, gentle pinks
- **Elements**: Clouds, water, soft textures, minimalist
- **Mood**: Peaceful, serene, gentle
- **Use**: Reflection, gratitude, mindfulness entries

#### Energetic Theme (energetic.jpg) ⚡
- **Colors**: Bright oranges, yellows, vibrant greens
- **Elements**: Sunrise, mountains, dynamic patterns
- **Mood**: Motivating, uplifting, powerful
- **Use**: Goal-setting, achievement, motivation entries

#### Reflective Theme (reflective.jpg) 🌙
- **Colors**: Deep blues, purples, soft grays
- **Elements**: Night sky, stars, moon, quiet landscapes
- **Mood**: Contemplative, deep, introspective
- **Use**: Self-analysis, problem-solving, deep thoughts

#### Creative Theme (creative.jpg) 🎨
- **Colors**: Rich purples, teals, artistic gradients
- **Elements**: Abstract patterns, artistic textures, inspiring visuals
- **Mood**: Inspiring, imaginative, expressive
- **Use**: Creative writing, brainstorming, artistic expression

## Mood Icons

### Technical Specifications
- **Format**: SVG (.svg)
- **Size**: 24x24px base size (scalable)
- **Style**: Simple, clean line art
- **Colors**: Single color (will be styled with CSS)
- **Stroke**: 2px stroke width

### Icon Set

#### mood-happy.svg 😊
- Simple smiling face
- Upward curved mouth
- Bright, cheerful expression

#### mood-sad.svg 😢
- Downward curved mouth
- Slightly drooped eyes
- Gentle, not overly dramatic

#### mood-calm.svg 😌
- Peaceful, closed or half-closed eyes
- Neutral, content mouth
- Serene expression

#### mood-excited.svg 🤩
- Wide, bright eyes
- Big smile
- Energetic, enthusiastic feel

#### mood-anxious.svg 😰
- Worried brow
- Uncertain mouth
- Concerned but not alarming

## Free Resources

### Background Images
1. **Unsplash**: https://unsplash.com/
   - Search: "calm background", "energetic sunrise", "night sky reflective"
2. **Pexels**: https://www.pexels.com/
   - Abstract and nature backgrounds
3. **Gradient Hunt**: https://gradienthunt.com/
   - Beautiful gradient backgrounds

### Icons
1. **Heroicons**: https://heroicons.com/
   - Clean, simple SVG icons
2. **Feather Icons**: https://feathericons.com/
   - Minimalist icon set
3. **Lucide**: https://lucide.dev/
   - Beautiful, customizable icons
4. **Tabler Icons**: https://tabler-icons.io/
   - Free SVG icons

## Creating Custom Mood Icons

### Using Figma (Free)
1. Create 24x24px frame
2. Use 2px stroke weight
3. Keep design simple and recognizable
4. Export as SVG
5. Optimize with SVGO

### SVG Template
```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
  <!-- Add facial features here -->
</svg>
```

## Usage in Journal

### Backgrounds
- Applied as subtle background images with low opacity
- Automatically selected based on user's chosen theme
- Responsive and optimized for different screen sizes

### Mood Icons
- Used in mood tracking components
- Styled with CSS for consistent theming
- Accessible with proper alt text and ARIA labels

## Optimization

### Images
```bash
# Optimize JPEG backgrounds
convert input.jpg -resize 1920x1080 -quality 80 output.jpg
```

### SVG Icons
```bash
# Optimize SVG files
svgo input.svg -o output.svg
```

## Accessibility

1. **Color Contrast**: Ensure text remains readable over backgrounds
2. **Alt Text**: Provide meaningful descriptions for mood icons
3. **Reduced Motion**: Consider users with motion sensitivity
4. **High Contrast**: Icons work in high contrast mode

## Quick Setup

1. **Backgrounds**: Find 4 images matching theme descriptions
2. **Icons**: Download or create 5 simple mood face SVGs
3. **Optimize**: Compress images and clean SVG code
4. **Test**: Verify all assets load correctly in journal interface

The journal will automatically apply appropriate themes and allow users to track their mood with the provided icons.