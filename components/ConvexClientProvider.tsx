'use client'

import { ReactNode } from 'react'

// Demo mode - bypass Convex for now
export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}