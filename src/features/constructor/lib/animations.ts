// Animations for constructor UI using anime.js v4
import { useEffect, useRef } from 'react'

// Check if animejs is available
let anime: typeof import('animejs') | null = null
try {
  import('animejs').then(m => { anime = m })
} catch {}

// ─── Animation Hooks ──────────────────────────────────────────────────────────────

// Animate-in on mount
export function useAnimateIn<T extends HTMLElement>(
  options?: {
    delay?: number
    duration?: number
    easing?: string
  }
) {
  const ref = useRef<T>(null)
  
  useEffect(() => {
    if (!ref.current || !anime) return
    
    const { animate } = window as any
    if (animate) {
      animate(ref.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: options?.delay || 0,
        duration: options?.duration || 400,
        easing: options?.easing || 'out(2)',
      })
    }
  }, [])
  
  return ref
}

// Animate hover effect
export function useAnimateHover<T extends HTMLElement>(
  onHoverIn?: () => void,
  onHoverOut?: () => void
) {
  const ref = useRef<T>(null)
  const { animate } = window as any
  
  useEffect(() => {
    if (!ref.current || !animate) return
    
    ref.current.addEventListener('mouseenter', () => {
      animate(ref.current, {
        scale: 1.05,
        duration: 200,
        easing: 'out(2)',
      })
      onHoverIn?.()
    })
    
    ref.current.addEventListener('mouseleave', () => {
      animate(ref.current, {
        scale: 1,
        duration: 200,
        easing: 'out(2)',
      })
      onHoverOut?.()
    })
  }, [])
  
  return ref
}

// Animate button press
export function useAnimatePress<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const { animate } = window as any
  
  const handlePress = () => {
    if (!ref.current || !animate) return
    
    animate(ref.current, {
      scale: [1, 0.95, 1],
      duration: 150,
      easing: 'out(2)',
    })
  }
  
  return { ref, handlePress }
}

// Animate panel slide
export function animateSlideIn(
  element: HTMLElement,
  direction: 'left' | 'right' | 'up' | 'down' = 'up',
  options?: { delay?: number; duration?: number }
) {
  const { animate } = window as any
  if (!animate) return
  
  const from = {
    left: [-50, 0],
    right: [50, 0],
    up: [30, 0],
    down: [-30, 0],
  }[direction]
  
  animate(element, {
    opacity: [0, 1],
    translate: from,
    delay: options?.delay || 0,
    duration: options?.duration || 300,
    easing: 'out(2)',
  })
}

// Animate success feedback
export function animateSuccess(element: HTMLElement) {
  const { animate } = window as any
  if (!animate) return
  
  animate(element, {
    scale: [0.8, 1.1, 1],
    backgroundColor: ['#000000', '#16a34a', '#16a34a'],
    duration: 400,
    easing: 'spring(1, 80)',
  })
}

// Animate error shake
export function animateError(element: HTMLElement) {
  const { animate } = window as any
  if (!animate) return
  
  animate(element, {
    translateX: [-10, 10, -10, 10, 0],
    duration: 400,
    easing: 'out(2)',
  })
}

// Stagger animation for lists
export function animateStagger(
  elements: HTMLElement[],
  options?: {
    delay?: number
    duration?: number
    stagger?: number
  }
) {
  const { animate } = window as any
  if (!animate) return
  
  animate(elements, {
    opacity: [0, 1],
    translateY: [20, 0],
    delay: animate.stagger(options?.stagger || 50, { from: 'first' }),
    duration: options?.duration || 300,
    easing: 'out(2)',
  })
}

export default {
  useAnimateIn,
  useAnimateHover,
  useAnimatePress,
  animateSlideIn,
  animateSuccess,
  animateError,
  animateStagger,
}