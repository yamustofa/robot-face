import { useEffect, useState } from 'react'
import { RobotFace, type Emotion } from './robot-face'

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
  const { emotion, duration } = loop[index]

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % loop.length)
    }, duration)

    return () => window.clearTimeout(timer)
  }, [duration, index])

  const enterFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => undefined)
  }

  return (
    <main className="face-loop" aria-label="Animated Roopa robot-face display" onPointerDown={enterFullscreen}>
      <RobotFace emotion={emotion} color="#c8ff6a" blinking interactive screenOnly />
    </main>
  )
}
