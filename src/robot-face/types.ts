export const emotions = [
  'happy',
  'neutral',
  'sad',
  'wink',
  'surprised',
  'angry',
  'sleepy',
  'love',
  'confused',
  'excited',
  'laughing',
  'annoyed',
  'crying',
] as const

export type Emotion = (typeof emotions)[number]

export type ExpressionTransitionPhase = 'idle' | 'closing' | 'opening'

export type RobotFaceProps = {
  emotion?: Emotion
  color?: string
  talking?: boolean
  blinking?: boolean
  loading?: boolean
  interactive?: boolean
  screenOnly?: boolean
  transitionPhase?: ExpressionTransitionPhase
  className?: string
  label?: string
}
