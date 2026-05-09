'use client'

import { Suspense, lazy, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
  onLoad?: () => void
}

export function SplineScene({ scene, className, onLoad }: SplineSceneProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
    if (onLoad) onLoad()
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          >
            <div className="w-6 h-6 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <Suspense fallback={null}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
          transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full"
        >
          <Spline
            scene={scene}
            onLoad={handleLoad}
            className="w-full h-full"
          />
        </motion.div>
      </Suspense>
    </div>
  )
}
