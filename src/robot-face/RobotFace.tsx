import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { expressionConfig, type EyeGlyph, type MouthStyle } from './expression-config'
import type { Emotion, RobotFaceProps } from './types'
import './robot-face.css'

const EYE_Y = 52
const LEFT_EYE_X = 48
const RIGHT_EYE_X = 112
const MOUTH_X = 80
const MOUTH_Y = 92
const CLOSE_DURATION_MS = 90
const OPEN_DURATION_MS = 150

type TransitionPhase = 'idle' | 'closing' | 'opening'
type EyeSide = 'left' | 'right'

function PixelEye({ glyph, side }: { glyph: EyeGlyph; side: EyeSide }) {
  switch (glyph) {
    case 'dot':
      return <rect className="robot-face__fill" x={-5} y={-7} width="10" height="14" />
    case 'line':
      return <path d="M-13 0h26" />
    case 'arc':
      return <path d="M-16 7V0h8v-8H8v8h8v7" />
    case 'sad':
      return side === 'left'
        ? <path d="M-15 -7h8v5h8v5h8v5h6" />
        : <path d="M-15 8h6V3h8v-5h8v-5h8" />
    case 'angry':
      return side === 'left'
        ? <path d="M-15 8h6V3h8v-5h8v-5h8" />
        : <path d="M-15 -7h8v5h8v5h8v5h6" />
    case 'round':
      return <path d="M-8 -13H8v5h5V8H8v5H-8V8h-5V-8h5Z" />
    case 'small-round':
      return <rect className="robot-face__fill" x={-5} y={-5} width="10" height="10" />
    case 'heart':
      return <path className="robot-face__fill" d="M-15 -7h5v-5h8v5h4v-5h8v5h5V3h-5v5H5v5H0v5h-5v-5h-5V8h-5Z" />
    case 'star':
      return <path className="robot-face__fill" d="M-4 -16h8v8h8v4h4v8h-4v4H4v8h-8V8h-8V4h-4v-8h4v-4h8Z" />
    case 'annoyed':
      return side === 'left'
        ? <path d="M-15 6V-3h30" />
        : <path d="M-15 -3h30v9" />
  }
}

function EyePair({ eyes, blink }: { eyes: readonly [EyeGlyph, EyeGlyph]; blink: boolean }) {
  const visibleEyes: readonly [EyeGlyph, EyeGlyph] = blink ? ['line', 'line'] : eyes

  return (
    <>
      <g transform={`translate(${LEFT_EYE_X} ${EYE_Y})`}>
        <PixelEye glyph={visibleEyes[0]} side="left" />
      </g>
      <g transform={`translate(${RIGHT_EYE_X} ${EYE_Y})`}>
        <PixelEye glyph={visibleEyes[1]} side="right" />
      </g>
    </>
  )
}

function PixelMouth({ style }: { style: MouthStyle }) {
  switch (style) {
    case 'smile':
      return <path d="M-24 -7v7h8v8h32V0h8v-7" />
    case 'line':
      return <path d="M-18 0h36" />
    case 'frown':
      return <path d="M-24 9V2h8v-8h32v8h8v7" />
    case 'o':
      return <path d="M-8 -12H8v5h5V7H8v5H-8V7h-5V-7h5Z" />
    case 'small':
      return <path d="M-6 0H6" />
    case 'crooked':
      return <path d="M-22 6h11V0H0v6h11V0h11" />
    case 'laugh':
      return <path d="M-24 -7h48v22h-8v8h-32v-8h-8Z" />
    case 'cry':
      return <path transform="translate(0 16) scale(1 -1)" d="M-24 -7h48v22h-8v8h-32v-8h-8Z" />
  }
}

function Mouth({ style, talking }: { style: MouthStyle; talking: boolean }) {
  return (
    <g transform={`translate(${MOUTH_X} ${MOUTH_Y})`}>
      {talking ? (
        <rect x={-13} y={-4} width="26" height="8" rx="4" fill="none" stroke="currentColor">
          <animate attributeName="height" values="8;22;12;18;8" dur="750ms" repeatCount="indefinite" />
          <animate attributeName="y" values="-4;-11;-6;-9;-4" dur="750ms" repeatCount="indefinite" />
        </rect>
      ) : (
        <PixelMouth style={style} />
      )}
    </g>
  )
}

export function RobotFace({
  emotion = 'happy',
  color = '#c8ff6a',
  talking = false,
  blinking = true,
  loading = false,
  interactive = true,
  screenOnly = false,
  className = '',
  label,
}: RobotFaceProps) {
  const reduceMotion = useReducedMotion()
  const [displayedEmotion, setDisplayedEmotion] = useState<Emotion>(emotion)
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('idle')
  const [isBlinking, setIsBlinking] = useState(false)
  const [gaze, setGaze] = useState({ x: 0, y: 0 })
  const displayedEmotionRef = useRef<Emotion>(emotion)
  const pendingEmotionRef = useRef<Emotion>(emotion)
  const transitionTimer = useRef<number | undefined>(undefined)
  const blinkTimer = useRef<number | undefined>(undefined)
  const blinkEndTimer = useRef<number | undefined>(undefined)
  const config = expressionConfig[displayedEmotion]

  useEffect(() => {
    pendingEmotionRef.current = emotion

    if (reduceMotion) {
      window.clearTimeout(transitionTimer.current)
      displayedEmotionRef.current = emotion
      setDisplayedEmotion(emotion)
      setTransitionPhase('idle')
      return
    }

    if (emotion !== displayedEmotionRef.current) setTransitionPhase('closing')
  }, [emotion, reduceMotion])

  useEffect(() => {
    window.clearTimeout(transitionTimer.current)
    if (reduceMotion || transitionPhase === 'idle') return

    transitionTimer.current = window.setTimeout(() => {
      if (transitionPhase === 'closing') {
        const nextEmotion = pendingEmotionRef.current
        displayedEmotionRef.current = nextEmotion
        setDisplayedEmotion(nextEmotion)
        setTransitionPhase('opening')
      } else if (pendingEmotionRef.current !== displayedEmotionRef.current) {
        setTransitionPhase('closing')
      } else {
        setTransitionPhase('idle')
      }
    }, transitionPhase === 'closing' ? CLOSE_DURATION_MS : OPEN_DURATION_MS)

    return () => window.clearTimeout(transitionTimer.current)
  }, [reduceMotion, transitionPhase])

  useEffect(() => {
    window.clearTimeout(blinkTimer.current)
    window.clearTimeout(blinkEndTimer.current)
    setIsBlinking(false)

    if (!blinking || reduceMotion || transitionPhase !== 'idle') return

    const scheduleBlink = () => {
      blinkTimer.current = window.setTimeout(() => {
        setIsBlinking(true)
        blinkEndTimer.current = window.setTimeout(() => setIsBlinking(false), 130)
        scheduleBlink()
      }, 3000 + Math.random() * 4000)
    }

    scheduleBlink()
    return () => {
      window.clearTimeout(blinkTimer.current)
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
      className={`robot-face ${screenOnly ? 'robot-face--screen-only' : ''} ${displayedEmotion === 'angry' ? 'robot-face--glitch' : ''} ${className}`}
      style={cssVars}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetGaze}
      animate={reduceMotion || screenOnly ? undefined : { y: [0, -3, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      role="img"
      aria-label={label ?? `${displayedEmotion} robot face${talking ? ', talking' : ''}`}
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
            <motion.g
              className="robot-face__eyes"
              initial={false}
              animate={reduceMotion ? undefined : { scaleY: transitionPhase === 'closing' ? 0.08 : 1 }}
              transition={transitionPhase === 'closing'
                ? { duration: 0.09, ease: 'easeIn' }
                : { duration: 0.15, ease: 'easeOut' }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <EyePair eyes={config.eyes} blink={isBlinking && transitionPhase === 'idle'} />
            </motion.g>
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
              {displayedEmotion === 'crying' && (
                <motion.g
                  key="tears"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  <g className="robot-face__tears"><path d="M48 52v28" /><path d="M112 52v28" /></g>
                </motion.g>
              )}
            </AnimatePresence>
          </motion.svg>
          {loading && <div className="robot-face__loader" aria-hidden="true"><i /><i /><i /><i /></div>}
          <AnimatePresence initial={false}>
            {displayedEmotion === 'sleepy' && (
              <motion.span
                key="zzz"
                className="robot-face__zzz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                zZ
              </motion.span>
            )}
          </AnimatePresence>
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
