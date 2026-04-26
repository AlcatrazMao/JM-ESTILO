// Animations for constructor elements

export type AnimationType = 
  | 'none' 
  | 'fadeIn' 
  | 'slideInLeft' 
  | 'slideInRight' 
  | 'slideInTop' 
  | 'slideInBottom'
  | 'scaleIn' 
  | 'bounceIn' 
  | 'pulse'

export interface AnimationConfig {
  type: AnimationType
  duration: number  // ms
  delay: number   // ms
  ease: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

export const DEFAULT_ANIMATION: AnimationConfig = {
  type: 'none',
  duration: 300,
  delay: 0,
  ease: 'ease-out',
}

export const ANIMATION_PRESETS: AnimationConfig[] = [
  { type: 'fadeIn', duration: 300, delay: 0, ease: 'ease-out' },
  { type: 'slideInLeft', duration: 300, delay: 0, ease: 'ease-out' },
  { type: 'slideInRight', duration: 300, delay: 0, ease: 'ease-out' },
  { type: 'slideInTop', duration: 300, delay: 0, ease: 'ease-out' },
  { type: 'slideInBottom', duration: 300, delay: 0, ease: 'ease-out' },
  { type: 'scaleIn', duration: 300, delay: 0, ease: 'ease-out' },
  { type: 'bounceIn', duration: 500, delay: 0, ease: 'ease-out' },
  { type: 'pulse', duration: 1000, delay: 0, ease: 'linear' },
]

// Get CSS animation from config
export function getAnimationCSS(config: AnimationConfig, elementRef: React.RefObject<HTMLElement>) {
  const { type, duration, delay, ease } = config
  
  if (type === 'none' || !elementRef.current) return
  
  const keyframes = getKeyframes(type)
  elementRef.current.animate(keyframes, {
    duration,
    delay,
    easing: ease,
    fill: 'forwards',
  })
}

// Get keyframes for animation type
function getKeyframes(type: AnimationType): Keyframe[] {
  switch (type) {
    case 'fadeIn':
      return [
        { opacity: 0 },
        { opacity: 1 },
      ]
    case 'slideInLeft':
      return [
        { transform: 'translateX(-100%)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
      ]
    case 'slideInRight':
      return [
        { transform: 'translateX(100%)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
      ]
    case 'slideInTop':
      return [
        { transform: 'translateY(-100%)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 },
      ]
    case 'slideInBottom':
      return [
        { transform: 'translateY(100%)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 },
      ]
    case 'scaleIn':
      return [
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 },
      ]
    case 'bounceIn':
      return [
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1.2)', opacity: 1, offset: 0.6 },
        { transform: 'scale(1)', opacity: 1 },
      ]
    case 'pulse':
      return [
        { transform: 'scale(1)' },
        { transform: 'scale(1.05)' },
        { transform: 'scale(1)' },
      ]
    default:
      return []
  }
}

// Get animation name for CSS class
export function getAnimationClass(type: AnimationType): string {
  const map: Record<AnimationType, string> = {
    none: '',
    fadeIn: 'animate-fade-in',
    slideInLeft: 'animate-slide-in-left',
    slideInRight: 'animate-slide-in-right',
    slideInTop: 'animate-slide-in-top',
    slideInBottom: 'animate-slide-in-bottom',
    scaleIn: 'animate-scale-in',
    bounceIn: 'animate-bounce-in',
    pulse: 'animate-pulse',
  }
  return map[type]
}

export default AnimationConfig