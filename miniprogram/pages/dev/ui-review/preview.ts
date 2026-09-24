import { createReviewMock, getReviewTheme, REVIEW_ITEMS, setReviewTheme, type ReviewItem, type ReviewMock, type ReviewTheme } from './mock-factory'

interface PreviewData {
  authorized: boolean
  item: ReviewItem | null
  mock: ReviewMock
  theme: ReviewTheme
  devBadge: boolean
  isStar: boolean
  isTimeline: boolean
  isHome: boolean
  isSignal: boolean
  isCapsule: boolean
  isSplash: boolean
  isUs: boolean
  isGeneric: boolean
  isNoReply: boolean
  isResponded: boolean
  showResponseActions: boolean
  showHomeOffline: boolean
  showHomeIncoming: boolean
  showHomeResponded: boolean
  showTimelineEmpty: boolean
  showTimelineRecords: boolean
  showGenericAction: boolean
}
interface PreviewMethods {
  onLoad(query: { id?: string }): void
  goReview(): void
  selectTheme(event: WechatMiniprogram.TouchEvent): void
  closeBadge(): void
}
function isDevelopmentBuild(): boolean {
  try { return wx.getAccountInfoSync().miniProgram.envVersion === 'develop' } catch { return false }
}

Page<PreviewData, PreviewMethods>({
  data: { authorized: false, item: null, mock: createReviewMock('home-default'), theme: getReviewTheme(), devBadge: true, isStar: false, isTimeline: false, isHome: false, isSignal: false, isCapsule: false, isSplash: false, isUs: false, isGeneric: true, isNoReply: false, isResponded: false, showResponseActions: false, showHomeOffline: false, showHomeIncoming: false, showHomeResponded: false, showTimelineEmpty: false, showTimelineRecords: false, showGenericAction: false },
  onLoad(query) {
    if (!isDevelopmentBuild()) { wx.switchTab({ url: '/pages/home/index' }); return }
    const item = REVIEW_ITEMS.find((entry) => entry.id === query.id) ?? REVIEW_ITEMS[0]
    const isStar = item.id.startsWith('star-') || item.id === 'star-map'
    const isTimeline = item.id.startsWith('timeline')
    const isHome = item.id.startsWith('home-')
    const isSignal = item.id === 'incoming' || item.id.startsWith('incoming-') || item.id.includes('reply') || item.id === 'already-responded'
    const isCapsule = item.section === '胶囊' || item.id.startsWith('capsule')
    const isSplash = item.section === '核心母版' && item.id === 'splash'
    const isUs = item.section === '核心母版' && item.id === 'us-home'
    const isNoReply = item.id === 'no-reply'
    const isResponded = item.id === 'already-responded'
    const isTimelineEmpty = item.id === 'timeline-empty'
    const showHomeOffline = item.id === 'home-offline'
    const showHomeIncoming = item.id === 'home-incoming'
    const showHomeResponded = item.id === 'home-responded'
    const isGeneric = !isSplash && !isHome && !isSignal && !isStar && !isTimeline && !isUs
    const showGenericAction = item.section === '系统状态' || item.id === 'error'
    const theme = item.id === 'theme-dark' || item.id === 'home-dark' ? 'dark' : item.id === 'theme-light' ? 'light' : getReviewTheme()
    setReviewTheme(theme)
    this.setData({ authorized: true, item, mock: createReviewMock(item.id), isStar, isTimeline, isHome, isSignal, isCapsule, isSplash, isUs, isGeneric, isNoReply, isResponded, showResponseActions: !isNoReply && !isResponded, showHomeOffline, showHomeIncoming, showHomeResponded, showTimelineEmpty: isTimelineEmpty, showTimelineRecords: !isTimelineEmpty, showGenericAction, theme })
    wx.setNavigationBarTitle({ title: item.title })
  },
  goReview() { wx.navigateBack({ delta: 1 }) },
  closeBadge() { this.setData({ devBadge: false }) },
  selectTheme(event) {
    const theme = event.currentTarget.dataset.theme as ReviewTheme | undefined
    if (theme) { setReviewTheme(theme); this.setData({ theme }) }
  }
})
