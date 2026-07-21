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
const PIXEL_SIZE = 5
const CLOSE_DURATION_MS = 90
const OPEN_DURATION_MS = 150

type TransitionPhase = 'idle' | 'closing' | 'opening'
type EyeSide = 'left' | 'right'
type PixelPattern = readonly string[]

const EYE_PATTERNS = {
  dot: ['##', '##', '##'],
  line: ['#####'],
  arc: ['.###.', '#...#'],
  sadLeft: ['#....', '.##..', '...##'],
  sadRight: ['....#', '..##.', '##...'],
  angryLeft: ['...##', '.##..', '#....'],
  angryRight: ['##...', '..##.', '....#'],
  round: ['.###.', '#...#', '#...#', '#...#', '.###.'],
  smallRound: ['.##.', '#..#', '.##.'],
  heart: ['.#.#.', '#####', '#####', '.###.', '..#..'],
  star: ['..#..', '#.#.#', '.###.', '#####', '.###.', '#.#.#', '..#..'],
  annoyedLeft: ['#####', '....#'],
  annoyedRight: ['#####', '#....'],
} satisfies Record<string, PixelPattern>

const MOUTH_PATTERNS: Record<MouthStyle, PixelPattern> = {
  smile: ['#.........#', '.#.......#.', '..#######..'],
  line: ['#######'],
  frown: ['..#######..', '.#.......#.', '#.........#'],
  o: ['.###.', '#...#', '#...#', '#...#', '.###.'],
  small: ['###'],
  crooked: ['##.........', '..##.......', '....##.....', '......##...', '........###'],
  laugh: ['.#######.', '#.......#', '#.......#', '.#.....#.', '..#####..'],
  cry: ['..#######..', '.#.......#.', '#.........#'],
}

const SLEEP_ACCENT = [
  '###...####',
  '..#......#.',
  '.#......#..',
  '#......#...',
  '###...####',
] satisfies PixelPattern

function PixelGlyph({ pattern, x = 0, y = 0, size = PIXEL_SIZE }: {
  pattern: PixelPattern
  x?: number
  y?: number
  size?: number
}) {
  const width = Math.max(...pattern.map((row) => row.length)) * size
  const height = pattern.length * size

  return (
    <g transform={`translate(${x - width / 2} ${y - height / 2})`}>
      {pattern.flatMap((row, rowIndex) => [...row].map((cell, columnIndex) => (
        cell === '#'
          ? <rect
              className="robot-face__pixel"
              key={`${rowIndex}-${columnIndex}`}
              x={columnIndex * size}
              y={rowIndex * size}
              width={size}
              height={size}
            />
          : null
      )))}
    </g>
  )
}

function PixelEye({ glyph, side }: { glyph: EyeGlyph; side: EyeSide }) {
  let pattern: PixelPattern

  switch (glyph) {
    case 'dot':
      pattern = EYE_PATTERNS.dot
      break
    case 'line':
      pattern = EYE_PATTERNS.line
      break
    case 'arc':
      pattern = EYE_PATTERNS.arc
      break
    case 'sad':
      pattern = side === 'left' ? EYE_PATTERNS.sadLeft : EYE_PATTERNS.sadRight
      break
    case 'angry':
      pattern = side === 'left' ? EYE_PATTERNS.angryLeft : EYE_PATTERNS.angryRight
      break
    case 'round':
      pattern = EYE_PATTERNS.round
      break
    case 'small-round':
      pattern = EYE_PATTERNS.smallRound
      break
    case 'heart':
      pattern = EYE_PATTERNS.heart
      break
    case 'star':
      pattern = EYE_PATTERNS.star
      break
    case 'annoyed':
      pattern = side === 'left' ? EYE_PATTERNS.annoyedLeft : EYE_PATTERNS.annoyedRight
      break
  }

  return <PixelGlyph pattern={pattern} />
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
  return <PixelGlyph pattern={MOUTH_PATTERNS[style]} />
}
function Mouth({ style, talking }: { style: MouthStyle; talking: boolean }) {
  return (
    <g transform={`translate(${MOUTH_X} ${MOUTH_Y})`}>
      {talking ? (
        <g>
          <PixelGlyph pattern={MOUTH_PATTERNS.o} />
          <animateTransform
            attributeName="transform"
            type="scale"
            values="1 0.55;1 1;1 0.7;1 1;1 0.55"
            dur="750ms"
            calcMode="discrete"
            repeatCount="indefinite"
          />
        </g>
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
            fill="currentColor"
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
                  <g className="robot-face__tears">
                    <PixelGlyph pattern={['##', '##', '##', '##']} x={48} y={75} />
                    <PixelGlyph pattern={['##', '##', '##', '##']} x={112} y={75} />
                  </g>
                </motion.g>
              )}
              {displayedEmotion === 'sleepy' && (
                <motion.g
                  key="zzz"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  <PixelGlyph pattern={SLEEP_ACCENT} x={133} y={27} size={3} />
                </motion.g>
              )}
            </AnimatePresence>
          </motion.svg>
          {loading && <div className="robot-face__loader" aria-hidden="true"><i /><i /><i /><i /></div>}

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
