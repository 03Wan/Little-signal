import { getCapsule, openCapsule } from '../../services/capsule-service'
import type { Capsule } from '../../types'
import { getNavigationTopPadding } from '../../utils/navigation'

interface CapsuleDetailPageData {
  pageTopPadding: number
  capsuleId: string
  status: Capsule['status'] | ''
  unlockLabel: string
  openedLabel: string
  content: string
  imagePath: string
  loading: boolean
  opening: boolean
  loadError: boolean
  missing: boolean
}

function dateTimeLabel(timestamp: number): string {
  const date = new Date(timestamp)
  const pad = (value: number) => value < 10 ? `0${value}` : `${value}`
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface CapsuleDetailPageMethods {
  onLoad(query: Record<string, string | undefined>): void
  loadCapsule(): Promise<void>
  open(): Promise<void>
  goBack(): void
}

Page<CapsuleDetailPageData, CapsuleDetailPageMethods>({
  data: { pageTopPadding: getNavigationTopPadding(), capsuleId: '', status: '', unlockLabel: '', openedLabel: '', content: '', imagePath: '', loading: true, opening: false, loadError: false, missing: false },
  onLoad(query) {
    this.setData({ capsuleId: query.id || '' })
    void this.loadCapsule()
  },
  async loadCapsule() {
    this.setData({ loading: true, loadError: false, missing: false, content: '', imagePath: '' })
    try {
      const capsule = await getCapsule(this.data.capsuleId)
      if (!capsule) {
        this.setData({ loading: false, missing: true })
        return
      }
      const bodyIsAvailable = capsule.status === 'opened'
      this.setData({ loading: false, status: capsule.status, unlockLabel: dateTimeLabel(capsule.unlockAt), openedLabel: capsule.openedAt ? dateTimeLabel(capsule.openedAt) : '', content: bodyIsAvailable ? capsule.content || '' : '', imagePath: bodyIsAvailable ? capsule.imageId || '' : '' })
    } catch {
      this.setData({ loading: false, loadError: true })
    }
  },
  async open() {
    if (this.data.opening || !this.data.capsuleId) return
    this.setData({ opening: true })
    try {
      const capsule = await openCapsule(this.data.capsuleId)
      this.setData({ status: 'opened', opening: false, content: capsule.content || '', imagePath: capsule.imageId || '', openedLabel: capsule.openedAt ? dateTimeLabel(capsule.openedAt) : '' })
    } catch (error) {
      const message = error instanceof Error ? error.message : '暂时无法打开，再试一次'
      this.setData({ opening: false })
      wx.showToast({ title: message, icon: 'none' })
      if (message === '还不能打开') this.setData({ status: 'locked' })
    }
  },
  goBack() { wx.navigateBack() }
})
