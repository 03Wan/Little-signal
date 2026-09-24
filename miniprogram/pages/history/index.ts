import { getAllTimelineEntries } from '../../services/timeline-service'
import type { SignalType, TimelineEntry } from '../../types'
import { getNavigationTopPadding } from '../../utils/navigation'

type StarTone = 'core' | 'warm' | 'blue'
interface SignalStar extends TimelineEntry { starId: string; x: number; y: number; size: number; tone: StarTone; responded: boolean; twinkleDelay: number }

interface StarMapData {
  pageTopPadding: number
  month: string
  pointCount: number
  monthOffset: number
  allEntries: SignalStar[]
  stars: SignalStar[]
  selectedStar: SignalStar | null
  selectedIndex: number
  sheetOpen: boolean
  loading: boolean
  loadError: boolean
  touchStartX: number
}

interface StarMapMethods {
  onShow(): void
  setTabBarHidden(hidden: boolean): void
  loadSignals(): Promise<void>
  updateVisibleMonth(): void
  goToPreviousMonth(): void
  goToNextMonth(): void
  openStar(event: WechatMiniprogram.TouchEvent): void
  closeStarSheet(): void
  handleDetailTouchStart(event: WechatMiniprogram.TouchEvent): void
  handleDetailTouchEnd(event: WechatMiniprogram.TouchEvent): void
  selectStar(index: number): void
  openTimeline(): void
  openMonthly(): void
}

const toneByType: Record<SignalType, StarTone> = {
  thinking_of_you: 'core', hug: 'warm', tired: 'blue', happy: 'warm', home: 'core', goodnight: 'blue', knock: 'core', available: 'warm', custom: 'warm', photo: 'blue'
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`
}

function getMonthLabel(date: Date): string {
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

function hashSignal(id: string, axis: 'x' | 'y' | 'size' | 'twinkle'): number {
  let hash = 2166136261
  const source = `${id}:${axis}`
  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function makeStar(entry: TimelineEntry): SignalStar {
  const xHash = hashSignal(entry.signal.id, 'x')
  const yHash = hashSignal(entry.signal.id, 'y')
  const sizeHash = hashSignal(entry.signal.id, 'size')
  const twinkleHash = hashSignal(entry.signal.id, 'twinkle')
  return {
    ...entry,
    starId: entry.signal.id,
    x: 6 + xHash % 88,
    y: 6 + yHash % 86,
    size: 3 + sizeHash % 3,
    tone: toneByType[entry.signal.type],
    responded: Boolean(entry.response),
    twinkleDelay: (twinkleHash % 10) * 0.12
  }
}

Page<StarMapData, StarMapMethods>({
  data: {
    pageTopPadding: getNavigationTopPadding(),
    month: getMonthLabel(new Date()),
    pointCount: 0,
    monthOffset: 0,
    allEntries: [],
    stars: [] as SignalStar[],
    selectedStar: null as SignalStar | null,
    selectedIndex: -1,
    sheetOpen: false,
    loading: true,
    loadError: false,
    touchStartX: 0
  },
  onShow() {
    this.setTabBarHidden(false)
    this.getTabBar().setData({ selectedKey: 'footprints' })
    void this.loadSignals()
  },
  async loadSignals() {
    this.setData({ loading: true, loadError: false })
    try {
      const entries = await getAllTimelineEntries()
      this.setData({ allEntries: entries.map(makeStar), loading: false })
      this.updateVisibleMonth()
    } catch {
      this.setData({ loading: false, loadError: true })
    }
  },
  updateVisibleMonth() {
    const date = new Date()
    date.setDate(1)
    date.setMonth(date.getMonth() + this.data.monthOffset)
    const monthKey = getMonthKey(date)
    const stars = this.data.allEntries.filter((star) => getMonthKey(new Date(star.signal.createdAt)) === monthKey)
    this.setData({ month: getMonthLabel(date), stars, pointCount: stars.length })
  },
  goToPreviousMonth() {
    this.setData({ monthOffset: this.data.monthOffset - 1, sheetOpen: false, selectedStar: null, selectedIndex: -1 })
    this.updateVisibleMonth()
  },
  goToNextMonth() {
    if (this.data.monthOffset >= 0) return
    this.setData({ monthOffset: this.data.monthOffset + 1, sheetOpen: false, selectedStar: null, selectedIndex: -1 })
    this.updateVisibleMonth()
  },
  openStar(event) {
    const index = Number(event.currentTarget.dataset.index)
    this.setTabBarHidden(true)
    this.selectStar(index)
    this.setData({ sheetOpen: true })
  },
  selectStar(index) {
    const selectedStar = this.data.stars[index]
    if (selectedStar) this.setData({ selectedStar, selectedIndex: index })
  },
  closeStarSheet() {
    this.setTabBarHidden(false)
    this.setData({ sheetOpen: false, selectedStar: null, selectedIndex: -1 })
  },
  setTabBarHidden(hidden) {
    this.getTabBar().setData({ hidden })
  },
  handleDetailTouchStart(event) {
    const touch = event.touches[0]
    if (touch) this.setData({ touchStartX: touch.clientX })
  },
  handleDetailTouchEnd(event) {
    const touch = event.changedTouches[0]
    if (!touch || !this.data.touchStartX) return
    const distance = touch.clientX - this.data.touchStartX
    const nextIndex = distance <= -44 ? this.data.selectedIndex + 1 : distance >= 44 ? this.data.selectedIndex - 1 : this.data.selectedIndex
    if (nextIndex >= 0 && nextIndex < this.data.stars.length && nextIndex !== this.data.selectedIndex) this.selectStar(nextIndex)
    this.setData({ touchStartX: 0 })
  },
  openTimeline() {
    wx.navigateTo({ url: '/pages/timeline/index' })
  },
  openMonthly() {
    wx.navigateTo({ url: '/pages/monthly/index' })
  }
})
