'use client'

import { BookOpen, Smartphone, Target } from 'lucide-react'
import { usePanelStore } from '@/store/usePanelStore'
import { ContentLibrary, DigitalWellness, WellnessPlan } from './panels'

export default function PanelTriggers() {
  const { activePanel, openPanel, closePanel } = usePanelStore()

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed right-6 bottom-24 flex flex-col gap-3 z-30">
        <button
          onClick={() => openPanel('content')}
          className="p-4 bg-brand text-white rounded-full shadow-lg hover:bg-brand-deep transition-all hover:scale-110"
          title="Content Library"
        >
          <BookOpen className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => openPanel('wellness')}
          className="p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110"
          title="Digital Wellness"
        >
          <Smartphone className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => openPanel('plan')}
          className="p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110"
          title="Wellness Plan"
        >
          <Target className="w-6 h-6" />
        </button>
      </div>

      {/* Panels */}
      <ContentLibrary
        isOpen={activePanel === 'content'}
        onClose={closePanel}
      />
      
      <DigitalWellness
        isOpen={activePanel === 'wellness'}
        onClose={closePanel}
      />
      
      <WellnessPlan
        isOpen={activePanel === 'plan'}
        onClose={closePanel}
      />
    </>
  )
}
