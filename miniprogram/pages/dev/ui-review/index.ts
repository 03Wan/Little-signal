import { getReviewTheme, REVIEW_GROUPS, setReviewTheme, type ReviewItem, type ReviewTheme } from './mock-factory'
import { listCapsules } from '../../../services/capsule-service'

interface ReviewPageData {
  authorized: boolean
  groups: typeof REVIEW_GROUPS
  theme: ReviewTheme
  device: { width: number; height: number; safeArea: string; pixelRatio: number }
}

interface ReviewPageMethods {
  onLoad(): void
  openReview(event: WechatMiniprogram.TouchEvent): void
  openRealRoute(event: WechatMiniprogram.TouchEvent): Promise<void>
  selectTheme(event: WechatMiniprogram.TouchEvent): void
}

function isDevelopmentBuild(): boolean {
  try { return wx.getAccountInfoSync().miniProgram.envVersion === 'develop' } catch { return false }
}

Page<ReviewPageData, ReviewPageMethods>({
  data: { authorized: false, groups: REVIEW_GROUPS, theme: getReviewTheme(), device: { width: 0, height: 0, safeArea: '读取中', pixelRatio: 1 } },
  onLoad() {
    if (!isDevelopmentBuild()) {
      wx.switchTab({ url: '/pages/home/index' })
      return
    }
    const info = wx.getSystemInfoSync()
    const safe = info.safeArea
    this.setData({ authorized: true, device: {
      width: info.windowWidth,
      height: info.windowHeight,
      safeArea: safe ? `${safe.top} – ${safe.bottom}px` : '系统未提供',
      pixelRatio: info.pixelRatio
    } })
  },
  openReview(event) {
    if (!isDevelopmentBuild()) return
    const id = event.currentTarget.dataset.id as string | undefined
    const item: ReviewItem | undefined = REVIEW_GROUPS.reduce<ReviewItem | undefined>((found, group) => found ?? group.items.find((entry) => entry.id === id), undefined)
    if (!item) return
    if (item.id.startsWith('route-')) {
      void this.openRealRoute(event)
      return
    }
    wx.navigateTo({ url: `/pages/dev/ui-review/preview?id=${encodeURIComponent(item.id)}` })
  },
  async openRealRoute(event) {
    if (!isDevelopmentBuild()) return
    const id = event.currentTarget.dataset.id as string | undefined
    const item = REVIEW_GROUPS.reduce<ReviewItem | undefined>((found, group) => found ?? group.items.find((entry) => entry.id === id), undefined)
    if (!item) return
    const tabRoutes = ['/pages/home/index', '/pages/history/index', '/pages/us/index']
    if (tabRoutes.includes(item.page)) {
      wx.switchTab({ url: item.page })
      return
    }
    if (item.page === '/pages/capsule/detail') {
      try {
        const capsules = await listCapsules()
        const desiredStatus = item.id === 'capsule-opened' ? 'opened' : item.id === 'capsule-unlocked' ? 'unlocked' : 'locked'
        const capsule = capsules.find((entry) => entry.status === desiredStatus) ?? capsules[0]
        wx.navigateTo({ url: capsule ? `${item.page}?id=${encodeURIComponent(capsule.id)}` : '/pages/capsule/index' })
      } catch {
        wx.navigateTo({ url: '/pages/capsule/index' })
      }
      return
    }
    wx.navigateTo({ url: item.page })
  },
  selectTheme(event) {
    const theme = event.currentTarget.dataset.theme as ReviewTheme | undefined
    if (!theme) return
    setReviewTheme(theme)
    this.setData({ theme })
  }
})
