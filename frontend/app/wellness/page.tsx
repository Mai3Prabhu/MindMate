'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import { WellnessPlanModal } from '@/components/wellness'

export default function WellnessPage() {
  const router = useRouter()

  // Automatically open the wellness plan modal when this page loads
  // Then redirect back to previous page when closed
  useEffect(() => {
    // This page just serves as a route, the actual content is in the modal
  }, [])

  return (
    <AppLayout>
      <WellnessPlanModal 
        isOpen={true} 
        onClose={() => router.back()} 
      />
    </AppLayout>
  )
}
