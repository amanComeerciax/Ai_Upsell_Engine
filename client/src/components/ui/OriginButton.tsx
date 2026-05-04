/**
 * OriginButton — cursor-origin expanding circle hover effect
 * Inspired by: https://framer.com/m/OriginButton-GIfh.js
 *
 * Drop-in wrapper: wrap any <button> or <a> content with this.
 * The circle expands from the exact point the cursor enters.
 */
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, useState, startTransition } from 'react'
import { cn } from '@/lib/utils'

interface OriginButtonProps {
  children: React.ReactNode
  className?: string
  /** Base background colour of the button */
  bgColor?: string
  /** Colour of the expanding hover circle */
  hoverColor?: string
  /** Extra inline styles */
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  id?: string
}

export function OriginButton({
  children,
  className = '',
  bgColor,
  hoverColor = 'rgba(255,255,255,0.12)',
  style,
  onClick,
  type = 'button',
  disabled,
  id,
}: OriginButtonProps) {
  const containerRef = useRef<HTMLButtonElement>(null)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })

  const scale = useMotionValue(0)
  const smoothScale = useSpring(scale, { stiffness: 85, damping: 18, restDelta: 0.001 })
  // Ease: t² so the circle accelerates outward
  const easedScale = useTransform(smoothScale, [0, 1], [0, 1], {
    ease: (t: number) => t * t,
  })

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    startTransition(() => setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top }))
    scale.set(1)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    startTransition(() => setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top }))
    scale.set(0)
  }

  // Circle must be big enough to cover entire button from any corner entry point
  const circleSize = 800

  return (
    <button
      ref={containerRef}
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn('relative overflow-hidden', className)}
      style={{ backgroundColor: bgColor, ...style }}
    >
      {/* Expanding origin circle */}
      <motion.span
        aria-hidden
        style={{
          position: 'absolute',
          left: cursorPos.x,
          top: cursorPos.y,
          width: circleSize,
          height: circleSize,
          borderRadius: '50%',
          backgroundColor: hoverColor,
          scale: easedScale,
          x: '-50%',
          y: '-50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Content sits above the circle */}
      <span className="relative z-10 flex items-center justify-center gap-[inherit] w-full h-full">
        {children}
      </span>
    </button>
  )
}
