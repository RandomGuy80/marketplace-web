'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function Cursor() {
  const [visible, setVisible] = useState(false)
  const [clicking, setClicking] = useState(false)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springX = useSpring(cursorX, { stiffness: 500, damping: 40 })
  const springY = useSpring(cursorY, { stiffness: 500, damping: 40 })

  useEffect(() => {
    // Only show on non-touch devices
    if ('ontouchstart' in window) return

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      setVisible(true)
    }
    const down = () => setClicking(true)
    const up = () => setClicking(false)

    window.addEventListener('mousemove', move)
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
    }
  }, [cursorX, cursorY])

  if (!visible) return null

  return (
    <>
      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: clicking ? 0.6 : 1 }}
        transition={{ duration: 0.1 }}
      >
        <div className="w-4 h-4 bg-white rounded-full" />
      </motion.div>
    </>
  )
}
