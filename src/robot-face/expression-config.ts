import type { Emotion } from './types'

export type EyeGlyph = 'dot' | 'line' | 'arc' | 'sad' | 'angry' | 'round' | 'small-round' | 'heart' | 'star' | 'annoyed'
export type MouthStyle = 'smile' | 'line' | 'frown' | 'o' | 'small' | 'crooked' | 'laugh' | 'cry'

export type ExpressionConfig = {
  eyes: readonly [EyeGlyph, EyeGlyph]
  mouth: MouthStyle
}

export const expressionConfig: Record<Emotion, ExpressionConfig> = {
  happy: { eyes: ['arc', 'arc'], mouth: 'smile' },
  neutral: { eyes: ['dot', 'dot'], mouth: 'line' },
  sad: { eyes: ['sad', 'sad'], mouth: 'frown' },
  wink: { eyes: ['dot', 'line'], mouth: 'smile' },
  surprised: { eyes: ['round', 'round'], mouth: 'o' },
  angry: { eyes: ['angry', 'angry'], mouth: 'line' },
  sleepy: { eyes: ['line', 'line'], mouth: 'small' },
  love: { eyes: ['heart', 'heart'], mouth: 'smile' },
  confused: { eyes: ['small-round', 'round'], mouth: 'crooked' },
  excited: { eyes: ['star', 'star'], mouth: 'laugh' },
  laughing: { eyes: ['arc', 'arc'], mouth: 'laugh' },
  annoyed: { eyes: ['annoyed', 'annoyed'], mouth: 'line' },
  crying: { eyes: ['line', 'line'], mouth: 'cry' },
}
