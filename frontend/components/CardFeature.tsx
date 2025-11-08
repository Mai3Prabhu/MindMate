'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { ComponentType, SVGProps } from 'react'

interface CardFeatureProps {
  title: string
  description: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  href: string
  gradient?: 'lavender' | 'sunset' | 'ocean' | 'default'
}

export default function CardFeature({
  title,
  description,
  icon: Icon,
  href,
  gradient = 'default',
}: CardFeatureProps) {
  const gradients = {
    lavender: 'bg-gradient-to-br from-brand/15 via-brand/5 to-transparent hover:from-brand/20 hover:via-brand/10',
    sunset: 'bg-gradient-to-br from-blush/15 via-yellow/5 to-transparent hover:from-blush/20 hover:via-yellow/10',
    ocean: 'bg-gradient-to-br from-teal/15 via-brand/5 to-transparent hover:from-teal/20 hover:via-brand/10',
    default: 'bg-gradient-to-br from-brand/10 via-brand-light/5 to-transparent hover:from-brand/15 hover:via-brand-light/10',
  }

  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`${gradients[gradient]} card p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-brand/30`}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-dark-card/50 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/50 dark:border-dark-border/30">
            {Icon && <Icon className="w-7 h-7 text-brand" />}
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold mb-2 text-light-text dark:text-dark-text">
              {title}
            </h3>
            <p className="text-sm text-light-text/80 dark:text-dark-text/70">
              {description}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
