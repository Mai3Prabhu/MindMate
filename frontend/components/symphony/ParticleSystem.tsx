'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  emotion: string
}

interface ParticleSystemProps {
  emotions: Record<string, number>
  intensity: number
  className?: string
}

export default function ParticleSystem({ emotions, intensity, className = '' }: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles based on emotions
    const initParticles = () => {
      const particles: Particle[] = []
      const emotionEntries = Object.entries(emotions)
      
      if (emotionEntries.length === 0) {
        return particles
      }

      // Calculate total particles based on intensity (20-200 particles)
      const totalParticles = Math.floor(20 + intensity * 180)

      emotionEntries.forEach(([emotion, count]) => {
        const proportion = count / Object.values(emotions).reduce((a, b) => a + b, 0)
        const particleCount = Math.floor(totalParticles * proportion)

        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * (0.5 + intensity),
            vy: (Math.random() - 0.5) * (0.5 + intensity),
            size: 2 + Math.random() * 4 * intensity,
            color: getEmotionColor(emotion),
            alpha: 0.3 + Math.random() * 0.4,
            emotion,
          })
        }
      })

      return particles
    }

    particlesRef.current = initParticles()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1
          particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1
          particle.y = Math.max(0, Math.min(canvas.height, particle.y))
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.alpha
        ctx.fill()
      })

      // Draw connections between nearby particles
      ctx.globalAlpha = 0.1
      particlesRef.current.forEach((p1, i) => {
        particlesRef.current.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = p1.color
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      ctx.globalAlpha = 1

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [emotions, intensity])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ background: 'transparent' }}
    />
  )
}

function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    happy: 'rgba(255, 215, 0, 0.8)',      // Gold
    joyful: 'rgba(255, 215, 0, 0.8)',
    excited: 'rgba(255, 107, 107, 0.8)',  // Coral
    calm: 'rgba(135, 206, 235, 0.8)',     // Sky Blue
    peaceful: 'rgba(135, 206, 235, 0.8)',
    relaxed: 'rgba(152, 216, 200, 0.8)',  // Mint
    sad: 'rgba(74, 144, 226, 0.8)',       // Blue
    anxious: 'rgba(155, 89, 182, 0.8)',   // Purple
    stressed: 'rgba(231, 76, 60, 0.8)',   // Red
    angry: 'rgba(231, 76, 60, 0.8)',
    frustrated: 'rgba(255, 140, 66, 0.8)', // Orange
    bored: 'rgba(149, 165, 166, 0.8)',    // Gray
    tired: 'rgba(127, 140, 141, 0.8)',    // Dark Gray
    energetic: 'rgba(243, 156, 18, 0.8)', // Yellow-Orange
    focused: 'rgba(39, 174, 96, 0.8)',    // Green
    grateful: 'rgba(241, 196, 15, 0.8)',  // Yellow
    hopeful: 'rgba(52, 152, 219, 0.8)',   // Light Blue
    lonely: 'rgba(52, 73, 94, 0.8)',      // Dark Blue-Gray
    confused: 'rgba(155, 127, 255, 0.8)', // Lavender
    neutral: 'rgba(189, 195, 199, 0.8)',  // Light Gray
  }

  return colors[emotion.toLowerCase()] || 'rgba(155, 127, 255, 0.8)'
}
