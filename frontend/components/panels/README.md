# Side Panel Components

Side panels provide quick access to wellness utilities from any authenticated page in the application.

## Overview

The side panel system consists of:
- **Global State Management**: Zustand store for panel visibility
- **Three Panel Components**: Content Library, Digital Wellness, Wellness Plan
- **Floating Action Buttons**: Always accessible triggers
- **Smooth Animations**: Slide-in/out with backdrop dimming

## Architecture

### State Management (Zustand)

```typescript
// store/usePanelStore.ts
interface PanelStore {
  activePanel: 'content' | 'wellness' | 'plan' | null
  openPanel: (panel: PanelType) => void
  closePanel: () => void
  togglePanel: (panel: PanelType) => void
}
```

**Usage:**
```typescript
import { usePanelStore } from '@/store/usePanelStore'

const { activePanel, openPanel, closePanel } = usePanelStore()

// Open a panel
openPanel('content')

// Close current panel
closePanel()

// Toggle a panel
togglePanel('wellness')
```

---

## Components

### 1. ContentLibrary.tsx

Curated mental health resources with filtering and progress tracking.

**Features:**
- Category filtering (mindfulness, emotional wellness, cognitive health, etc.)
- Type filtering (article, video, podcast)
- Progress tracking (opened/completed)
- External link opening in new tab
- SWR for data fetching
- Responsive design

**Props:**
```typescript
interface ContentLibraryProps {
  isOpen: boolean
  onClose: () => void
}
```

**API Integration:**
- `GET /api/content/library` - Fetch content items
- `POST /api/content/progress` - Track content opened

**Categories:**
- All Topics
- Mindfulness
- Emotional Wellness
- Cognitive Health
- Relationships
- Stress Management

**Content Types:**
- Article (📖)
- Video (🎥)
- Podcast (🎧)

---

### 2. DigitalWellness.tsx

Screen time monitoring and AI-powered behavior analysis.

**Features:**
- Average daily screen time display
- Screen time trend chart (Recharts)
- Top 5 apps by usage
- Time range selector (7/14/30 days)
- AI behavior analysis with Gemini
- Pattern detection display
- Personalized recommendations
- Risk level indicator

**Props:**
```typescript
interface DigitalWellnessProps {
  isOpen: boolean
  onClose: () => void
}
```

**API Integration:**
- `GET /api/digital-wellness/metrics` - Fetch metrics
- `POST /api/digital-wellness/analyze` - Get AI analysis

**Detected Patterns:**
- Excessive screen time
- Increasing usage
- Doomscrolling
- Binge watching

**Risk Levels:**
- Low (green)
- Moderate (orange)
- High (red)

---

### 3. WellnessPlan.tsx

Daily wellness goal tracking with streak management.

**Features:**
- Four activity types (meditation, journal, breath, movement)
- Streak tracking with fire emoji
- Daily goal progress bars
- Activity logging
- Goal editing mode
- Visual feedback for completed activities
- Motivational messages

**Props:**
```typescript
interface WellnessPlanProps {
  isOpen: boolean
  onClose: () => void
}
```

**API Integration:**
- `GET /api/wellness-plan` - Fetch plan data
- `PUT /api/wellness-plan` - Update goals
- `POST /api/wellness-plan/activity` - Log activity

**Activities:**
1. **Meditation** 🧘
   - Default goal: 20 minutes
   - Color: Purple to Pink gradient

2. **Journaling** 📝
   - Default goal: 15 minutes
   - Color: Blue to Cyan gradient

3. **Breathing** 🌬️
   - Default goal: 10 minutes
   - Color: Green to Emerald gradient

4. **Movement** 🏃
   - Default goal: 30 minutes
   - Color: Orange to Red gradient

**Streak Logic:**
- First time: Streak = 1
- Consecutive day: Streak increments
- Missed day: Streak resets to 1
- Same day: Already logged (disabled button)

---

### 4. PanelTriggers.tsx

Floating action buttons and panel orchestration.

**Features:**
- Three floating action buttons (bottom right)
- Hover scale animation
- Tooltips on hover
- Manages all three panels
- Uses Zustand store for state

**Buttons:**
1. **Content Library** (Purple) - BookOpen icon
2. **Digital Wellness** (Blue) - Smartphone icon
3. **Wellness Plan** (Green) - Target icon

**Position:** Fixed at `right-6 bottom-24`

---

## Animations

All panels use Framer Motion for smooth transitions:

### Backdrop
```typescript
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
```

### Panel Slide-in
```typescript
initial={{ x: '100%' }}
animate={{ x: 0 }}
exit={{ x: '100%' }}
transition={{ type: 'spring', damping: 30, stiffness: 300 }}
```

### Content Stagger
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.05 }}
```

---

## Integration

### AppLayout Integration

The `PanelTriggers` component is added to `AppLayout.tsx`, making panels accessible from any authenticated page:

```typescript
import PanelTriggers from './PanelTriggers'

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main>{children}</main>
      </div>
      
      {/* Available on all authenticated pages */}
      <PanelTriggers />
    </div>
  )
}
```

---

## Styling

### Panel Structure
- **Width**: Full width on mobile, 480px on desktop
- **Height**: Full viewport height
- **Position**: Fixed right side
- **Z-index**: 50 (panel), 40 (backdrop)
- **Background**: White (light mode), dark-card (dark mode)
- **Shadow**: 2xl shadow for depth

### Responsive Design
- Mobile: Full width panel
- Desktop: 480px width panel
- Smooth transitions on all screen sizes

### Dark Mode Support
All components fully support dark mode with appropriate color schemes.

---

## Data Flow

### Content Library
```
User clicks content item
  → Track opened (POST /api/content/progress)
  → Open URL in new tab
  → SWR revalidates data
```

### Digital Wellness
```
User clicks "Get AI Insights"
  → Fetch metrics (GET /api/digital-wellness/metrics)
  → Analyze with Gemini (POST /api/digital-wellness/analyze)
  → Display results with animations
```

### Wellness Plan
```
User clicks "Log Today"
  → Log activity (POST /api/wellness-plan/activity)
  → Update streak calculation
  → SWR mutates local data
  → Show success feedback
```

---

## Accessibility

### Keyboard Navigation
- Panels can be closed with Escape key (via backdrop click)
- All interactive elements are keyboard accessible
- Focus management within panels

### ARIA Labels
- Buttons have descriptive titles
- Icons have appropriate aria-hidden attributes
- Semantic HTML structure

### Screen Readers
- Proper heading hierarchy
- Descriptive button text
- Status updates announced

---

## Performance Optimizations

1. **Conditional Rendering**: Panels only render when open
2. **SWR Caching**: Automatic data caching and revalidation
3. **Lazy Loading**: Data fetched only when panel opens
4. **Optimistic Updates**: Immediate UI feedback
5. **AnimatePresence**: Smooth mount/unmount animations

---

## Requirements Satisfied

- ✅ 8.1: Content Library slide-in panel
- ✅ 8.3: Digital Wellness panel with screen time display
- ✅ 8.6: Wellness Plan dashboard with progress bars
- ✅ 8.7: Smooth slide-in/out transitions with backdrop dimming
- ✅ 8.8: Global state management (Zustand)
- ✅ 8.8: Accessible from any authenticated page

---

## Usage Examples

### Opening a Panel Programmatically

```typescript
import { usePanelStore } from '@/store/usePanelStore'

function MyComponent() {
  const { openPanel } = usePanelStore()
  
  return (
    <button onClick={() => openPanel('content')}>
      Open Content Library
    </button>
  )
}
```

### Checking Active Panel

```typescript
const { activePanel } = usePanelStore()

if (activePanel === 'wellness') {
  // Digital Wellness panel is open
}
```

### Closing All Panels

```typescript
const { closePanel } = usePanelStore()

closePanel() // Closes any open panel
```

---

## Browser Compatibility

- **Animations**: All modern browsers (Framer Motion)
- **State Management**: All browsers (Zustand)
- **Charts**: All modern browsers (Recharts)
- **Fetch API**: All modern browsers

---

## Future Enhancements

- [ ] Panel resize functionality
- [ ] Multiple panels open simultaneously
- [ ] Panel position customization (left/right)
- [ ] Keyboard shortcuts for opening panels
- [ ] Panel history/navigation
- [ ] Offline support with service workers
- [ ] Push notifications for wellness reminders
- [ ] Export wellness data
- [ ] Social sharing of achievements
- [ ] Integration with wearable devices

---

## Troubleshooting

### Panel not opening
- Check Zustand store state
- Verify `isOpen` prop is true
- Check for JavaScript errors in console

### Data not loading
- Verify API endpoints are accessible
- Check authentication token
- Review network tab for failed requests

### Animations stuttering
- Check for performance issues
- Reduce animation complexity
- Verify Framer Motion is properly installed

### Dark mode issues
- Ensure Tailwind dark mode is configured
- Check CSS class names
- Verify theme provider is set up
