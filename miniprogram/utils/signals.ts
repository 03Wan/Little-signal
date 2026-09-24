import type { SignalType } from '../types'

export interface SignalOption {
  key: string
  type: SignalType
  label: string
  icon: string
  pickerLabel: string
  customSignalId?: string
  x: number
  y: number
}

export const SIGNAL_OPTIONS: SignalOption[] = [
  { key: 'thinking_of_you', type: 'thinking_of_you', label: '想到你', pickerLabel: '想到你了', icon: '◎', x: 0, y: 0 },
  { key: 'hug', type: 'hug', label: '抱一下', pickerLabel: '抱一下', icon: '♡', x: 112, y: -66 },
  { key: 'tired', type: 'tired', label: '有点累', pickerLabel: '今天有点累', icon: '☁', x: -112, y: -66 },
  { key: 'happy', type: 'happy', label: '开心', pickerLabel: '今天挺开心', icon: '☼', x: 112, y: 66 },
  { key: 'home', type: 'home', label: '到家了', pickerLabel: '到家了', icon: '⌂', x: -112, y: 66 },
  { key: 'goodnight', type: 'goodnight', label: '晚安', pickerLabel: '晚安', icon: '☾', x: 0, y: -132 },
  { key: 'knock', type: 'knock', label: '敲一下', pickerLabel: '敲一下', icon: '··', x: 0, y: 132 }
]

export function getQuickSignalSelection(
  offsetX: number,
  offsetY: number,
  selectionRadius = 52
): SignalType | null {
  let nearestType: SignalType | null = null
  let nearestDistance = Number.POSITIVE_INFINITY

  for (const signal of SIGNAL_OPTIONS) {
    const distanceX = offsetX - signal.x
    const distanceY = offsetY - signal.y
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
    if (distance < nearestDistance) {
      nearestType = signal.type
      nearestDistance = distance
    }
  }

  return nearestDistance <= selectionRadius ? nearestType : null
}
