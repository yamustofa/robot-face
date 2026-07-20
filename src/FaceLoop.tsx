import { useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { RobotFace, type Emotion, type ExpressionTransitionPhase } from './robot-face'

const CLOSE_DURATION = 90
const OPEN_DURATION = 150

const loop: Array<{ emotion: Emotion; duration: number }> = [
  { emotion: 'happy', duration: 4200 },
  { emotion: 'excited', duration: 2600 },
  { emotion: 'laughing', duration: 3400 },
  { emotion: 'annoyed', duration: 2200 },
  { emotion: 'crying', duration: 3200 },
  { emotion: 'angry', duration: 2400 },
  { emotion: 'laughing', duration: 3200 },
]

export default function FaceLoop() {
  const [index, setIndex] = useState(0)
  const [transitionPhase, setTransitionPhase] = useState<ExpressionTransitionPhase>('idle')
  const reduceMotion = useReducedMotion()
  const { emotion, duration } = loop[index]

  useEffect(() => {
    if (transitionPhase !== 'idle') return

    const timer = window.setTimeout(() => {
      if (reduceMotion) {
        setIndex((current) => (current + 1) % loop.length)
      } else {
        setTransitionPhase('closing')
      }
    }, duration)

    return () => window.clearTimeout(timer)
  }, [duration, index, reduceMotion, transitionPhase])

  useEffect(() => {
    if (reduceMotion) {
      if (transitionPhase !== 'idle') setTransitionPhase('idle')
      return
    }

    if (transitionPhase === 'idle') return

    const timer = window.setTimeout(() => {
      if (transitionPhase === 'closing') {
        setIndex((current) => (current + 1) % loop.length)
        setTransitionPhase('opening')
      } else {
        setTransitionPhase('idle')
      }
    }, transitionPhase === 'closing' ? CLOSE_DURATION : OPEN_DURATION)

    return () => window.clearTimeout(timer)
  }, [reduceMotion, transitionPhase])

  const enterFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => undefined)
  }

  return (
    <main className="face-loop" aria-label="Animated Roopa robot-face display" onPointerDown={enterFullscreen}>
      <RobotFace
        emotion={emotion}
        color="#c8ff6a"
        blinking
        interactive={transitionPhase === 'idle'}
        screenOnly
        transitionPhase={transitionPhase}
      />
    </main>
  )
}