import type { Emotion } from './types'

export type EyeStyle = 'soft' | 'flat' | 'sad' | 'wink' | 'round' | 'angry' | 'sleepy' | 'heart' | 'confused' | 'excited' | 'droopy' | 'unamused'
export type MouthStyle = 'smile' | 'flat' | 'frown' | 'open' | 'grit' | 'small' | 'wobble' | 'laugh' | 'tremble'

export const expressionConfig: Record<Emotion, { eyes: EyeStyle; mouth: MouthStyle }> = {
  happy: { eyes: 'soft', mouth: 'smile' },
  neutral: { eyes: 'flat', mouth: 'flat' },
  sad: { eyes: 'droopy', mouth: 'frown' },
  wink: { eyes: 'wink', mouth: 'smile' },
  surprised: { eyes: 'round', mouth: 'open' },
  angry: { eyes: 'angry', mouth: 'grit' },
  sleepy: { eyes: 'sleepy', mouth: 'small' },
  love: { eyes: 'heart', mouth: 'smile' },
  confused: { eyes: 'confused', mouth: 'wobble' },
  excited: { eyes: 'excited', mouth: 'smile' },
  laughing: { eyes: 'soft', mouth: 'laugh' },
  annoyed: { eyes: 'unamused', mouth: 'flat' },
  crying: { eyes: 'droopy', mouth: 'tremble' },
}
