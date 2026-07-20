import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { expressionConfig, type EyeStyle, type MouthStyle } from './expression-config'
import type { RobotFaceProps } from './types'
import './robot-face.css'

const eyeOffsetX: Partial<Record<EyeStyle, number>> = {
  soft: -3,
  wink: -3,
  droopy: -1,
  round: -5,
  unamused: -1,
  heart: -2,
  confused: -4,
}

function EyePair({ style, blink }: { style: EyeStyle; blink: boolean }) {
  if (blink) {
    return <path d="M36 55h20 M104 55h20" />
  }

  switch (style) {
    case 'soft':
      return <path d="M34 59v-7h7v-7h14v7h7v7 M104 59v-7h7v-7h14v7h7v7" />
    case 'flat':
      return <><rect x="40" y="42" width="8" height="22" /><rect x="112" y="42" width="8" height="22" /></>
    case 'sad':
      return <path d="M35 47h7v7h7v7h7 M104 61h7v-7h7v-7h7" />
    case 'droopy':
      return <path d="M34 61v-4h8v-4h8v-4h8 M104 49h8v4h8v4h8v4" />
    case 'wink':
      return <><path d="M34 59v-7h7v-7h14v7h7v7" /><path d="M104 55h28" /></>
    case 'round':
      return <><path className="robot-face__fill" d="M39 45h7v-5h7v5h6v16h-6v5h-7v-5h-7Zm72 0h7v-5h7v5h6v16h-6v5h-7v-5h-7Z" /><path d="M46 49h7v8h-7Zm72 0h7v8h-7Z" /></>
    case 'angry':
      return <path d="M34 45h8v4h7v5h8 M126 45h-8v4h-7v5h-8" />
    case 'unamused':
      return <path d="M34 52h24v8 M104 52h24v8" />
    case 'sleepy':
      return <path d="M35 52h7v5h7v-5h7 M104 52h7v5h7v-5h7" />
    case 'heart':
      return <path className="robot-face__fill" d="M35 40h10v5h5v-5h10v5h5v10h-5v5h-5v5h-5v5h-5v-5h-5v-5h-5v-5h-5V45h5Zm70 0h10v5h5v-5h10v5h5v10h-5v5h-5v5h-5v5h-5v-5h-5v-5h-5v-5h-5V45h5Z" />
    case 'confused':
      return <><rect x="40" y="45" width="16" height="16" /><rect x="108" y="39" width="24" height="24" /></>
    case 'excited':
      return <path className="robot-face__fill" d="M43 40h7v7h7v7h-7v7h-7v-7h-7v-7h7Zm68 0h7v7h7v7h-7v7h-7v-7h-7v-7h7Z" />
  }
}

function Mouth({ style, talking }: { style: MouthStyle; talking: boolean }) {
  if (talking) {
    return (
      <rect
        x="67"
        y="88"
        width="26"
        height="8"
        rx="4"
        fill="none"
        stroke="currentColor"
      >
        <animate attributeName="height" values="8;22;12;18;8" dur="750ms" repeatCount="indefinite" />
        <animate attributeName="y" values="88;81;86;83;88" dur="750ms" repeatCount="indefinite" />
      </rect>
    )
  }

  switch (style) {
    case 'smile':
      return <path d="M58 84v8h7v7h30v-7h7v-8" />
    case 'flat':
      return <rect x="65" y="88" width="30" height="7" />
    case 'frown':
      return <path d="M58 102v-8h7v-7h30v7h7v8" />
    case 'open':
      return <path className="robot-face__fill" d="M68 85h6v-6h12v6h6v17h-6v6H74v-6h-6Zm7 1v15h10V86Z" />
    case 'grit':
      return <><rect x="61" y="83" width="38" height="19" /><path d="M74 83v19 M86 83v19 M61 92h38" /></>
    case 'small':
      return <rect x="73" y="88" width="14" height="7" />
    case 'wobble':
      return <path d="M61 94h9v-5h10v5h10v-5h9v5" />
    case 'tremble':
      return <path d="M58 114h44V93h-7v-7H65v7h-7Z" />
    case 'laugh':
      return <path d="M58 86h44v21h-7v7H65v-7h-7Z" />
  }
}

export function RobotFace({
  emotion = 'happy',
  color = '#c8ff6a',
  talking = false,
  blinking = true,
  loading = false,
  interactive = true,
  screenOnly = false,
  transitionPhase = 'idle',
  className = '',
  label,
}: RobotFaceProps) {
  const [isBlinking, setIsBlinking] = useState(false)
  const [gaze, setGaze] = useState({ x: 0, y: 0 })
  const timer = useRef<number | undefined>(undefined)
  const blinkEndTimer = useRef<number | undefined>(undefined)
  const reduceMotion = useReducedMotion()
  const config = expressionConfig[emotion]

  useEffect(() => {
    window.clearTimeout(timer.current)
    window.clearTimeout(blinkEndTimer.current)
    setIsBlinking(false)

    if (!blinking || reduceMotion || transitionPhase !== 'idle') return

    const scheduleBlink = () => {
      timer.current = window.setTimeout(() => {
        setIsBlinking(true)
        blinkEndTimer.current = window.setTimeout(() => setIsBlinking(false), 130)
        scheduleBlink()
      }, 3000 + Math.random() * 4000)
    }

    scheduleBlink()
    return () => {
      window.clearTimeout(timer.current)
      window.clearTimeout(blinkEndTimer.current)
    }
  }, [blinking, reduceMotion, transitionPhase])

  useEffect(() => {
    if (!interactive || transitionPhase !== 'idle') setGaze({ x: 0, y: 0 })
  }, [interactive, transitionPhase])

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive || reduceMotion || transitionPhase !== 'idle') return
    const bounds = event.currentTarget.getBoundingClientRect()
    setGaze({
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 7,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 5,
    })
  }

  const resetGaze = () => setGaze({ x: 0, y: 0 })
  const cssVars = { '--face-color': color } as CSSProperties

  return (
    <motion.div
      className={`robot-face ${screenOnly ? 'robot-face--screen-only' : ''} ${emotion === 'angry' ? 'robot-face--glitch' : ''} ${className}`}
      style={cssVars}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetGaze}
      animate={reduceMotion || screenOnly ? undefined : { y: [0, -3, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      role="img"
      aria-label={label ?? `${emotion} robot face${talking ? ', talking' : ''}`}
    >
      <div className="robot-face__shell">
        <span className="robot-face__screw robot-face__screw--left" />
        <span className="robot-face__screw robot-face__screw--right" />
        <div className="robot-face__screen">
          <div className="robot-face__bloom" />
          <motion.svg
            className="robot-face__features"
            viewBox="0 0 160 130"
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="square"
            strokeLinejoin="miter"
            shapeRendering="crispEdges"
            animate={{ x: gaze.x, y: gaze.y }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            aria-hidden="true"
          >
            <g transform={isBlinking ? undefined : `translate(${eyeOffsetX[config.eyes] ?? 0} 0)`}>
              <motion.g
                className="robot-face__eyes"
                initial={false}
                animate={reduceMotion ? undefined : { scaleY: transitionPhase === 'closing' ? 0.08 : 1 }}
                transition={transitionPhase === 'closing'
                  ? { duration: 0.09, ease: 'easeIn' }
                  : { duration: 0.15, ease: 'easeOut' }}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              >
                <EyePair style={config.eyes} blink={isBlinking && transitionPhase === 'idle'} />
              </motion.g>
            </g>
            <motion.g
              className="robot-face__mouth"
              initial={false}
              animate={reduceMotion ? undefined : {
                opacity: transitionPhase === 'closing' ? 0 : 1,
                scaleY: transitionPhase === 'closing' ? 0.85 : 1,
              }}
              transition={transitionPhase === 'closing'
                ? { duration: 0.09, ease: 'easeIn' }
                : { duration: 0.15, ease: 'easeOut' }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <Mouth style={config.mouth} talking={talking && !reduceMotion} />
            </motion.g>
            <AnimatePresence initial={false}>
              {emotion === 'crying' && (
                <motion.g
                  key="tears"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  <g className="robot-face__tears"><path d="M42 67v15" /><path d="M118 67v15" /></g>
                </motion.g>
              )}
            </AnimatePresence>
          </motion.svg>
          {loading && <div className="robot-face__loader" aria-hidden="true"><i /><i /><i /><i /></div>}
          {emotion === 'sleepy' && <span className="robot-face__zzz">zZ</span>}
          <div className="robot-face__scanlines" />
          <div className="robot-face__shine" />
        </div>
        <div className="robot-face__vents"><i /><i /><i /></div>
        <span className="robot-face__light" />
      </div>
    </motion.div>
  )
}

export type { Emotion, RobotFaceProps } from './types'
