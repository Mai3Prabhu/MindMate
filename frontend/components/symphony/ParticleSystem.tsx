'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface ParticleSystemProps {
  emotions: Record<string, number>
  intensity: number
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  emotion: string
  life: number
  maxLife: number
}

const emotionColors: Record<string, string> = {
  joy: '#FFD700',
  sadness: '#4169E1',
  anger: '#DC143C',
  fear: '#800080',
  surprise: '#FF69B4',
  disgust: '#228B22',
  calm: '#87CEEB',
  excited: '#FF4500',
  anxious: '#9370DB',
  content: '#32CD32',
  lonely: '#708090',
  grateful: '#FFB6C1',
  hopeful: '#98FB98',
  overwhelmed: '#B22222',
  peaceful: '#E0E6FF'
}

export default function ParticleSystem({ emotions, intensity }: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const nextIdRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const createParticle = (emotion: string): Particle => {
      return {
        id: nextIdRef.current++,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 2,
        color: emotionColors[emotion] || '#888888',
        emotion,
        life: 0,
        maxLife: Math.random() * 300 + 200
      }
    }

    const updateParticles = () => {
      const particles = particlesRef.current
      
      // Add new particles based on emotion distribution
      const totalEmotions = Object.values(emotions).reduce((sum, count) => sum + count, 0)
      if (totalEmotions > 0 && particles.length < 50) {
        for (const [emotion, count] of Object.entries(emotions)) {
          const probability = (count / totalEmotions) * intensity * 0.02
          if (Math.random() < probability) {
            particles.push(createParticle(emotion))
          }
        }
      }

      // Update existing particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]
        
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life++

        // Wrap around screen edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Remove old particles
        if (particle.life > particle.maxLife) {
          particles.splice(i, 1)
        }
      }
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const particles = particlesRef.current
      
      for (const particle of particles) {
        const alpha = Math.max(0, 1 - (particle.life / particle.maxLife))
        
        ctx.save()
        ctx.globalAlpha = alpha * 0.6
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        
        // Add glow effect
        ctx.globalAlpha = alpha * 0.3
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
      }

      // Draw connections between nearby particles
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
          
          if (distance < 100) {
            const alpha = (100 - distance) / 100 * 0.2
            ctx.globalAlpha = alpha
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      updateParticles()
      drawParticles()
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [emotions, intensity])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  )
}