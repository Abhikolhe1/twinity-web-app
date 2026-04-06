'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CelebrityPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/create/customize') }, [router])
  return null
}
