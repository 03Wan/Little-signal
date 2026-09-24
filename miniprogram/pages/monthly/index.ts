import { getAllTimelineEntries } from '../../services/timeline-service'
import type { TimelineEntry } from '../../types'

interface MonthlyPageData {
  month: string
  totalSignals: number
  activeDays: number
  photoCount: number
  customCount: number
  featuredEntry: TimelineEntry | null
  loading: boolean
  loadError: boolean
  initialized: boolean
}

interface MonthlyPageMethods {
  onLoad(): void
  loadSummary(): Promise<void>
  goBack(): void
  openTimeline(): void
}

function currentMonthKey(date: Date): string {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`
}

function formatMonth(date: Date): string {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

Page<MonthlyPageData, MonthlyPageMethods>({
  data: {
    month: formatMonth(new Date()),
    totalSignals: 0,
    activeDays: 0,
    photoCount: 0,
    customCount: 0,
    featuredEntry: null,
    loading: true,
    loadError: false,
    initialized: false
  },
  onLoad() { void this.loadSummary() },
  async loadSummary() {
    this.setData({ loading: true, loadError: false, initialized: false })
    try {
      const date = new Date()
      const key = currentMonthKey(date)
      const entries = await getAllTimelineEntries()
      const currentMonthEntries = entries.filter((entry) => currentMonthKey(new Date(entry.signal.createdAt)) === key)
      this.setData({
        month: formatMonth(date),
        totalSignals: currentMonthEntries.length,
        activeDays: new Set(currentMonthEntries.map((entry) => entry.dateKey)).size,
        photoCount: currentMonthEntries.filter((entry) => entry.signal.type === 'photo').length,
        customCount: currentMonthEntries.filter((entry) => entry.signal.type === 'custom').length,
        featuredEntry: currentMonthEntries[0] ?? null,
        loading: false,
        initialized: true
      })
    } catch {
      this.setData({ loading: false, loadError: true, initialized: true })
    }
  },
  goBack() { wx.navigateBack() },
  openTimeline() { wx.navigateTo({ url: '/pages/timeline/index' }) }
})
