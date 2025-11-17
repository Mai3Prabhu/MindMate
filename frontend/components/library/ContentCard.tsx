'use client'

import { motion } from 'framer-motion'
import { FileText, Video, Headphones, Activity, ExternalLink, Heart } from 'lucide-react'
import { useState } from 'react'

interface ContentCardProps {
  id: string
  title: string
  type: string
  category: string
  duration: string
  thumbnail: string
  description: string
  link: string
  onOpen: () => void
}

export default function ContentCard({
  title,
  type,
  category,
  duration,
  thumbnail,
  description,
  link,
  onOpen
}: ContentCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  const getTypeIcon = () => {
    switch (type) {
      case 'Article':
        return <FileText className="w-4 h-4" />
      case 'Video':
        return <Video className="w-4 h-4" />
      case 'Podcast':
        return <Headphones className="w-4 h-4" />
      case 'Activity':
        return <Activity className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getCategoryColor = () => {
    switch (category) {
      case 'Mindful':
        return 'bg-purple-500/20 text-purple-300'
      case 'Emotional Wellness':
        return 'bg-pink-500/20 text-pink-300'
      case 'Cognitive':
        return 'bg-blue-500/20 text-blue-300'
      case 'Relationships':
        return 'bg-green-500/20 text-green-300'
      case 'Stress Management':
        return 'bg-orange-500/20 text-orange-300'
      case 'Sleep & Relaxation':
        return 'bg-indigo-500/20 text-indigo-300'
      case 'Productivity':
        return 'bg-yellow-500/20 text-yellow-300'
      default:
        return 'bg-gray-500/20 text-gray-300'
    }
  }

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="card overflow-hidden cursor-pointer group"
      onClick={onOpen}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-brand/20 to-purple-500/20 overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-md bg-black/40 text-white text-xs">
          {getTypeIcon()}
          <span>{type}</span>
        </div>

        {/* Duration */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg backdrop-blur-md bg-black/40 text-white text-xs">
          {duration}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-brand transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {description}
        </p>

        {/* Category Tag */}
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor()}`}>
            {category}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsLiked(!isLiked)
              }}
              className={`p-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-gray-100 dark:bg-dark-deep text-gray-600 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
