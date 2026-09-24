import { getTimelinePage } from '../../services/timeline-service'
import type { TimelineEntry } from '../../types'
import { getNavigationTopPadding } from '../../utils/navigation'

interface TimelinePageData {
  pageTopPadding: number
  entries: TimelineEntry[]
  nextCursor: string | null
  loading: boolean
  loadingMore: boolean
  loadError: boolean
  initialized: boolean
}

interface TimelinePageMethods {
  onLoad(): void
  onReachBottom(): void
  loadInitial(): Promise<void>
  loadMore(): Promise<void>
  openSignal(event: WechatMiniprogram.TouchEvent): void
  goBack(): void
}

Page<TimelinePageData, TimelinePageMethods>({
  data: { pageTopPadding: getNavigationTopPadding(), entries: [], nextCursor: null, loading: true, loadingMore: false, loadError: false, initialized: false },
  onLoad() { void this.loadInitial() },
  onReachBottom() { void this.loadMore() },
  async loadInitial() {
    this.setData({ loading: true, loadError: false, initialized: false })
    try {
      const page = await getTimelinePage()
      this.setData({ entries: page.entries, nextCursor: page.nextCursor, loading: false, initialized: true })
    } catch {
      this.setData({ loading: false, loadError: true, initialized: true })
    }
  },
  async loadMore() {
    const cursor = this.data.nextCursor
    if (!cursor || this.data.loadingMore || this.data.loading) return
    this.setData({ loadingMore: true, loadError: false })
    try {
      const page = await getTimelinePage(cursor)
      this.setData({ entries: [...this.data.entries, ...page.entries], nextCursor: page.nextCursor, loadingMore: false })
    } catch {
      this.setData({ loadingMore: false, loadError: true })
    }
  },
  openSignal(event) {
    const signalId = event.currentTarget.dataset.signalid as string
    wx.navigateTo({ url: `/pages/signal/detail?signalId=${encodeURIComponent(signalId)}` })
  },
  goBack() { wx.navigateBack() }
})
