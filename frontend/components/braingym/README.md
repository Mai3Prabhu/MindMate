# Brain Gym Components

This directory contains all the cognitive game components for the MindMate Brain Gym feature.

## Components

### Games

1. **MemoryMatch.tsx** - Flip-card matching game
   - Match pairs of emoji cards by remembering their positions
   - Tracks moves and matches
   - Scoring based on efficiency (fewer moves = higher score)

2. **RecallGame.tsx** - Number sequence memorization
   - Remember and retype sequences of numbers
   - Progressive difficulty (starts at 4 digits, increases each level)
   - 3-second memorization window
   - Game ends after 5 levels or first mistake

3. **PatternGame.tsx** - Color sequence repetition
   - Watch and repeat color button sequences
   - Sequences grow longer with each successful round
   - Visual feedback with color animations
   - Progressive difficulty up to level 10

4. **ReactionTap.tsx** - Reaction time measurement
   - Tap when the screen turns green
   - Measures reaction time in milliseconds
   - 5 rounds per game
   - Score based on average reaction time

### Visualization

5. **ProgressVisualization.tsx** - Performance tracking and insights
   - Bar charts showing score progression over time
   - Statistics: best score, average score, total plays
   - AI-generated insights about cognitive performance
   - Time range selector (7 days / 30 days)
   - Recent scores list

## Features

- **Score Tracking**: All games automatically save scores to the backend
- **AI Insights**: Gemini AI generates encouraging insights about performance
- **Progress Charts**: Visual representation of improvement over time
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: All components support light/dark themes
- **Animations**: Smooth transitions using Framer Motion

## Usage

```tsx
import { MemoryMatch, RecallGame, PatternGame, ReactionTap, ProgressVisualization } from '@/components/braingym'

// In your component
<MemoryMatch onGameComplete={(score) => console.log('Score:', score)} />
<RecallGame onGameComplete={(score) => console.log('Score:', score)} />
<PatternGame onGameComplete={(score) => console.log('Score:', score)} />
<ReactionTap onGameComplete={(score) => console.log('Score:', score)} />

// Show progress for a specific game
<ProgressVisualization gameType="memory_match" gameName="Memory Match" />
```

## Backend Integration

All games integrate with the Brain Gym API endpoints:

- `POST /api/braingym/score` - Submit game scores
- `GET /api/braingym/scores` - Retrieve score history
- `GET /api/braingym/trends/{game_type}` - Get trends and AI insights

## Requirements Met

This implementation satisfies the following requirements from the spec:

- ✅ 6.1: Memory Match game (flip-card pairs)
- ✅ 6.2: Recall Game (remember and retype sequences)
- ✅ 6.3: Pattern Game (repeat color/button sequences)
- ✅ 6.4: Reaction Tap game (tap when color changes)
- ✅ 6.5: Progress visualization with bar charts
- ✅ AI-generated one-line insights about cognitive performance
