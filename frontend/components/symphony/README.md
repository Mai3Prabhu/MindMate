# Symphony Components

Symphony is the global emotional community feature that visualizes collective emotions through interactive particles, ambient sound, and real-time updates.

## Overview

Symphony creates an immersive, anonymous space where users can:
- Share their emotional state with the global community
- Visualize collective emotions through particle animations
- Experience ambient sound that reflects global mood
- Connect with others through "resonance" reactions
- See real-time mood patterns and trends

## Components

### 1. ParticleSystem.tsx
Canvas-based particle animation system that responds to mood data.

**Features:**
- Dynamic particle generation based on emotion distribution
- Particle count scales with mood intensity (20-200 particles)
- Each emotion has a unique color
- Particles bounce off canvas edges
- Draws connections between nearby particles
- Smooth animations at 60fps

**Props:**
```typescript
interface ParticleSystemProps {
  emotions: Record<string, number>  // Emotion distribution
  intensity: number                  // Mood intensity (0-1)
  className?: string
}
```

**Usage:**
```tsx
<ParticleSystem
  emotions={{ happy: 45, calm: 30, anxious: 25 }}
  intensity={0.75}
  className="opacity-30"
/>
```

---

### 2. GlobalMoodMap.tsx
Displays aggregated global mood statistics and emotion distribution.

**Features:**
- Three stat cards: Total Feelings, Dominant Emotion, Mood Intensity
- Animated emotion distribution bars
- Color-coded emotions
- Responsive grid layout
- Empty state handling

**Props:**
```typescript
interface GlobalMoodMapProps {
  emotionDistribution: Record<string, number>
  dominantEmotion: string | null
  totalPosts: number
  moodIntensity: number
}
```

**Usage:**
```tsx
<GlobalMoodMap
  emotionDistribution={{ happy: 45, calm: 30 }}
  dominantEmotion="happy"
  totalPosts={150}
  moodIntensity={0.75}
/>
```

---

### 3. SymphonyFeed.tsx
User contribution form and community feed display.

**Features:**
- Emotion selection with 10 preset emotions
- Optional text input (200 char limit)
- Anonymous posting
- Real-time feed updates
- Resonance (like) functionality
- Relative timestamps
- Smooth animations

**Props:**
```typescript
interface SymphonyFeedProps {
  posts: SymphonyPost[]
  onSubmitPost: (emotion: string, text?: string) => Promise<void>
  onResonate: (postId: string) => Promise<void>
}
```

**Usage:**
```tsx
<SymphonyFeed
  posts={recentPosts}
  onSubmitPost={handleSubmit}
  onResonate={handleResonate}
/>
```

---

### 4. AmbientSound.tsx
Generative ambient sound using Web Audio API.

**Features:**
- Emotion-based harmonic frequencies
- Volume scales with mood intensity
- Smooth frequency transitions
- Subtle vibrato effect
- Toggle on/off control
- Fixed position button

**Props:**
```typescript
interface AmbientSoundProps {
  intensity: number              // Volume multiplier (0-1)
  dominantEmotion: string | null // Determines frequencies
}
```

**Emotion Frequency Mapping:**
- Happy/Joyful: C major chord (261.63, 329.63, 392.00, 523.25 Hz)
- Calm/Peaceful: A minor chord (220.00, 277.18, 329.63, 440.00 Hz)
- Excited: D major chord (293.66, 369.99, 440.00, 587.33 Hz)
- Sad: A minor (220.00, 261.63, 329.63, 440.00 Hz)
- And more...

**Usage:**
```tsx
<AmbientSound
  intensity={0.75}
  dominantEmotion="happy"
/>
```

---

## Main Page Integration

The Symphony page (`app/symphony/page.tsx`) integrates all components with:

### Real-time Updates (SWR)
```typescript
const { data, error, mutate } = useSWR<GlobalMoodData>(
  `${API_URL}/api/symphony/global?hours=24&limit=100`,
  fetcher,
  {
    refreshInterval: 5000,      // Poll every 5 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  }
)
```

### API Integration
- **POST /api/symphony/post** - Submit emotions
- **POST /api/symphony/resonate** - React to posts
- **GET /api/symphony/global** - Fetch mood data

### Layout
- Fixed particle background (opacity 30%)
- Two-column grid (mood map + feed)
- Real-time indicator (bottom left)
- Ambient sound toggle (bottom right)
- Info panel (collapsible)

## Emotion Color Palette

| Emotion | Color | Hex Code |
|---------|-------|----------|
| Happy/Joyful | Gold | #FFD700 |
| Excited | Coral | #FF6B6B |
| Calm/Peaceful | Sky Blue | #87CEEB |
| Relaxed | Mint | #98D8C8 |
| Sad | Blue | #4A90E2 |
| Anxious | Purple | #9B59B6 |
| Stressed/Angry | Red | #E74C3C |
| Frustrated | Orange | #FF8C42 |
| Bored | Gray | #95A5A6 |
| Tired | Dark Gray | #7F8C8D |
| Energetic | Yellow-Orange | #F39C12 |
| Focused | Green | #27AE60 |
| Grateful | Yellow | #F1C40F |
| Hopeful | Light Blue | #3498DB |
| Lonely | Dark Blue-Gray | #34495E |
| Confused | Lavender | #9B7FFF |
| Neutral | Light Gray | #BDC3C7 |

## Features

### 1. Anonymous Contributions
- No user identification in feed
- Safe space for emotional expression
- Privacy-first design

### 2. Real-time Visualization
- Particle system responds to mood changes
- 5-second polling interval
- Smooth transitions and animations

### 3. Ambient Sound
- Web Audio API synthesis
- Emotion-based harmonics
- Dynamic volume control
- Optional (user can toggle)

### 4. Responsive Design
- Mobile-friendly layout
- Touch-optimized interactions
- Dark mode support

### 5. Accessibility
- Keyboard navigation
- ARIA labels
- Color contrast compliance
- Screen reader support

## Performance Optimizations

1. **Canvas Rendering**
   - RequestAnimationFrame for smooth 60fps
   - Efficient particle updates
   - Connection drawing optimization

2. **SWR Caching**
   - Automatic revalidation
   - Optimistic updates
   - Stale-while-revalidate pattern

3. **Component Lazy Loading**
   - Dynamic imports where appropriate
   - Code splitting

4. **Audio Context**
   - Single context instance
   - Proper cleanup on unmount
   - Suspended state handling

## Requirements Satisfied

- ✅ 7.1: Global mood map with aggregated emotions
- ✅ 7.2: Particle animation system responding to mood intensities
- ✅ 7.3: Generative background sound using Web Audio API
- ✅ 7.8: Real-time updates with SWR polling (5-second interval)

## Browser Compatibility

- **Canvas API**: All modern browsers
- **Web Audio API**: Chrome 35+, Firefox 25+, Safari 14.1+, Edge 79+
- **SWR**: All browsers with fetch support

## Installation Notes

### Required Dependencies
All dependencies are already installed:
- `swr` - Real-time data fetching
- `framer-motion` - Animations
- `date-fns` - Date formatting
- `lucide-react` - Icons

### Optional Enhancement
For more advanced audio synthesis, consider installing Tone.js:
```bash
npm install tone
```

However, the current implementation uses native Web Audio API which is sufficient for the ambient sound feature.

## Usage Example

```tsx
import { Symphony } from '@/app/symphony/page'

// The page handles all state and API calls internally
export default function App() {
  return <Symphony />
}
```

## Future Enhancements

- [ ] WebSocket for true real-time updates (instead of polling)
- [ ] 3D particle visualization with Three.js
- [ ] More complex audio synthesis with Tone.js
- [ ] Regional mood heatmap
- [ ] Emotion timeline/history view
- [ ] User emotion journal integration
- [ ] Community challenges and events
- [ ] Moderation tools
- [ ] Analytics dashboard

## Troubleshooting

### Particles not animating
- Check that emotions data is not empty
- Verify canvas has proper dimensions
- Check browser console for errors

### Sound not playing
- User must interact with page first (browser autoplay policy)
- Check that AudioContext is not suspended
- Verify browser supports Web Audio API

### Real-time updates not working
- Check API endpoint is accessible
- Verify SWR configuration
- Check network tab for polling requests

### Performance issues
- Reduce particle count by lowering intensity
- Disable ambient sound
- Check for memory leaks in console
