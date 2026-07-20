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
      return <rect className="robot-face__fill" x={-4} y={-4} width="8" height="8" />
    case 'line':
      return <path d="M-14 0h28" />
    case 'arc':
      return <path d="M-14 7V0h7v-7H7v7h7v7" />
    case 'sad':
      return side === 'left'
        ? <path d="M-14 7h7V0h7v-7h14" />
        : <path d="M-14 -7H0v7h7v7h7" />
    case 'angry':
      return side === 'left'
        ? <path d="M-14 -7h7v7h7v7h14" />
        : <path d="M-14 7H0V0h7v-7h7" />
    case 'round':
      return <path d="M-7 -14H7v7h7V7H7v7H-7V7h-7V-7h7Z" />
    case 'small-round':
      return <rect x={-7} y={-7} width="14" height="14" />
    case 'heart':
      return <path className="robot-face__fill" d="M-10 -12h8v4h4v-4h8v4h4v8h-4v4H6v4H2v4h-4V8h-4V4h-4V0h-4v-8h4Z" />
    case 'star':
      return <path className="robot-face__fill" d="M-4 -14h8v10h10v8H4v10h-8V4h-10v-8h10Z" />
    case 'annoyed':
      return <path d="M-14 -3h28v8" />
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
      return <path d="M-22 -8v7h7v7h30v-7h7v-7" />
    case 'line':
      return <path d="M-15 0h30" />
    case 'frown':
      return <path d="M-22 8V1h7v-7h30v7h7v7" />
    case 'o':
      return <path d="M-7 -12H7v5h7V7H7v5H-7V7h-7V-7h7Z" />
    case 'small':
      return <path d="M-7 0H7" />
    case 'crooked':
      return <path d="M-20 6h10V0H0v6h10V0h10" />
    case 'laugh':
      return <path d="M-22 -6h44v21h-7v7h-30v-7h-7Z" />
    case 'cry':
      return <path d="M-22 22h44V1h-7v-7h-30v7h-7Z" />
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
