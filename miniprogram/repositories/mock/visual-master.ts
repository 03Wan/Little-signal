import type { MoodType } from '../../types'

interface VisualPartnerMock {
  name: string
  moodType: MoodType
  moodLabel: string
}

interface StarPointMock {
  x: number
  y: number
  size: number
  opacity: number
}

export const visualPartnerMock: VisualPartnerMock = {
  name: '姚闻月',
  moodType: 'tired',
  moodLabel: '今天有点累'
}

export const incomingSignalMock = {
  senderName: '王波',
  message: '刚刚想到了你',
  time: '01:37',
  noReply: false
} as const

export const footprintMock = {
  month: 'September 2026',
  pointCount: 46,
  stars: [
    { x: 9, y: 21, size: 3, opacity: 0.52 }, { x: 19, y: 33, size: 4, opacity: 0.88 },
    { x: 31, y: 15, size: 3, opacity: 0.72 }, { x: 43, y: 27, size: 5, opacity: 0.96 },
    { x: 56, y: 17, size: 3, opacity: 0.62 }, { x: 69, y: 30, size: 4, opacity: 0.78 },
    { x: 83, y: 18, size: 3, opacity: 0.7 }, { x: 13, y: 47, size: 4, opacity: 0.84 },
    { x: 26, y: 61, size: 3, opacity: 0.58 }, { x: 38, y: 45, size: 5, opacity: 0.94 },
    { x: 51, y: 56, size: 3, opacity: 0.66 }, { x: 64, y: 45, size: 4, opacity: 0.92 },
    { x: 78, y: 56, size: 3, opacity: 0.6 }, { x: 91, y: 43, size: 4, opacity: 0.8 },
    { x: 7, y: 75, size: 3, opacity: 0.64 }, { x: 21, y: 86, size: 5, opacity: 0.94 },
    { x: 35, y: 76, size: 3, opacity: 0.74 }, { x: 49, y: 88, size: 4, opacity: 0.82 },
    { x: 63, y: 75, size: 3, opacity: 0.64 }, { x: 76, y: 87, size: 5, opacity: 0.96 },
    { x: 90, y: 74, size: 3, opacity: 0.62 }
  ] satisfies StarPointMock[]
}

export const relationshipMock = {
  firstName: '王波',
  partnerName: visualPartnerMock.name,
  days: 184,
  secretCount: 7,
  capsuleCount: 3
} as const
