'use client'

import { ReactNode } from 'react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

if (!convexUrl) {
  console.warn('NEXT_PUBLIC_CONVEX_URL is not set. Convex features will be disabled.')
}

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return <>{children}</>
  }
  
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  )
}