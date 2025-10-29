'use client'

import { ReactNode } from 'react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

if (!convexUrl) {
  console.warn('NEXT_PUBLIC_CONVEX_URL is not set. Convex features will be disabled.')
}

let convex: ConvexReactClient | null = null

// Only create the client if we have a valid URL
if (convexUrl) {
  try {
    convex = new ConvexReactClient(convexUrl)
  } catch (error) {
    console.error('Failed to create Convex client:', error)
  }
}

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Always render children, but only wrap with ConvexProvider if we have a valid client
  if (!convex) {
    return <>{children}</>
  }
  
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  )
}