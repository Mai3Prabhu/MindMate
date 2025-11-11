/**
 * Lazy-loaded components for better performance
 * Use these instead of direct imports for heavy components
 */

import dynamic from 'next/dynamic'
import { ContentSkeleton, CardSkeleton } from '../LazyLoad'

// Brain Gym Components
export const LazyMemoryMatch = dynamic(
  () => import('../braingym/MemoryMatch'),
  {
    loading: () => <ContentSkeleton />,
    ssr: false,
  }
)

export const LazyRecallGame = dynamic(
  () => import('../braingym/RecallGame'),
  {
    loading: () => <ContentSkeleton />,
    ssr: false,
  }
)

export const LazyPatternGame = dynamic(
  () => import('../braingym/PatternGame'),
  {
    loading: () => <ContentSkeleton />,
    ssr: false,
  }
)

export const LazyReactionTap = dynamic(
  () => import('../braingym/ReactionTap'),
  {
    loading: () => <ContentSkeleton />,
    ssr: false,
  }
)

export const LazyProgressVisualization = dynamic(
  () => import('../braingym/ProgressVisualization'),
  {
    loading: () => <ContentSkeleton />,
    ssr: false,
  }
)

// Symphony Components
export const LazyParticleSystem = dynamic(
  () => import('../symphony/ParticleSystem'),
  {
    loading: () => <div className="w-full h-full bg-gray-100 dark:bg-dark-deep animate-pulse" />,
    ssr: false,
  }
)

export const LazyGlobalMoodMap = dynamic(
  () => import('../symphony/GlobalMoodMap'),
  {
    loading: () => <CardSkeleton count={3} />,
    ssr: false,
  }
)

export const LazySymphonyFeed = dynamic(
  () => import('../symphony/SymphonyFeed'),
  {
    loading: () => <ContentSkeleton />,
    ssr: false,
  }
)

export const LazyAmbientSound = dynamic(
  () => import('../symphony/AmbientSound'),
  {
    loading: () => null,
    ssr: false,
  }
)

// Panel Components
export const LazyContentLibrary = dynamic(
  () => import('../panels/ContentLibrary'),
  {
    loading: () => null,
    ssr: false,
  }
)

export const LazyDigitalWellness = dynamic(
  () => import('../panels/DigitalWellness'),
  {
    loading: () => null,
    ssr: false,
  }
)

export const LazyWellnessPlan = dynamic(
  () => import('../panels/WellnessPlan'),
  {
    loading: () => null,
    ssr: false,
  }
)

// Chart Components (heavy dependencies)
export const LazyBarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  {
    loading: () => <div className="w-full h-[200px] bg-gray-100 dark:bg-dark-deep animate-pulse rounded" />,
    ssr: false,
  }
)

export const LazyLineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  {
    loading: () => <div className="w-full h-[200px] bg-gray-100 dark:bg-dark-deep animate-pulse rounded" />,
    ssr: false,
  }
)
