import { listCapsules } from '../../services/capsule-service'
import type { Capsule } from '../../types'
import { getNavigationActionInset, getNavigationTopPadding } from '../../utils/navigation'

interface CapsuleListItem extends Capsule {
  createdLabel: string
  unlockLabel: string
  statusLabel: string
  backgroundImage: string
}

interface CapsulePageData {
  pageTopPadding: number
  actionInset: number
  capsules: CapsuleListItem[]
  loading: boolean
  initialized: boolean
  loadError: boolean
}

function dateLabel(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const CAPSULE_BACKGROUNDS = [
  '/assets/capsule-unlocked.jpg',
  '/assets/capsule-opened.jpg',
  '/assets/capsule-mountain.jpg',
  '/assets/capsule-coast.jpg',
  '/assets/capsule-field.jpg'
]
const CAPSULE_BACKGROUND_STORAGE_KEY = 'little-signal-capsule-backgrounds'

function displayCapsule(capsule: Capsule): CapsuleListItem {
  const statusLabel = capsule.status === 'locked' ? '还不能打开' : capsule.status === 'unlocked' ? '有一个过去的信号正在等你打开' : '已打开'
  return { ...capsule, createdLabel: dateLabel(capsule.createdAt), unlockLabel: dateLabel(capsule.unlockAt), statusLabel, backgroundImage: '' }
}

function displayCapsules(capsules: Capsule[]): CapsuleListItem[] {
  const storedMap = wx.getStorageSync(CAPSULE_BACKGROUND_STORAGE_KEY) as Record<string, string> | undefined
  const backgroundMap = storedMap && typeof storedMap === 'object' && !Array.isArray(storedMap) ? { ...storedMap } : {}
  const used = new Set<string>()
  return capsules.map((capsule) => {
    const item = displayCapsule(capsule)
    const savedBackground = backgroundMap[capsule.id]
    const available = CAPSULE_BACKGROUNDS.filter((background) => !used.has(background))
    const candidates = available.length > 0 ? available : CAPSULE_BACKGROUNDS
    item.backgroundImage = savedBackground && CAPSULE_BACKGROUNDS.includes(savedBackground) && !used.has(savedBackground)
      ? savedBackground
      : candidates[Math.floor(Math.random() * candidates.length)]
    backgroundMap[capsule.id] = item.backgroundImage
    used.add(item.backgroundImage)
    return item
  })
}

interface CapsulePageMethods {
  onShow(): void
  loadCapsules(): Promise<void>
  createCapsule(): void
  openCapsule(event: WechatMiniprogram.TouchEvent): void
  goBack(): void
}

Page<CapsulePageData, CapsulePageMethods>({
  data: { pageTopPadding: getNavigationTopPadding(), actionInset: getNavigationActionInset(), capsules: [], loading: true, initialized: false, loadError: false },
  onShow() { void this.loadCapsules() },
  async loadCapsules() {
    this.setData({ loading: true, loadError: false })
    try {
      const capsules = await listCapsules()
      const displayItems = displayCapsules(capsules)
      wx.setStorageSync(CAPSULE_BACKGROUND_STORAGE_KEY, Object.fromEntries(displayItems.map((item) => [item.id, item.backgroundImage])))
      this.setData({ capsules: displayItems, loading: false, initialized: true })
    } catch {
      this.setData({ loading: false, initialized: true, loadError: true })
    }
  },
  createCapsule() { wx.navigateTo({ url: '/pages/capsule/create' }) },
  openCapsule(event) {
    const id = event.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/pages/capsule/detail?id=${encodeURIComponent(id)}` })
  },
  goBack() { wx.navigateBack() }
})
