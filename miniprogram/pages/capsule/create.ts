import { createCapsule, getCapsuleServerTime } from '../../services/capsule-service'
import { getNavigationActionInset, getNavigationTopPadding } from '../../utils/navigation'

interface CreateCapsulePageData {
  pageTopPadding: number
  actionInset: number
  content: string
  imagePath: string
  unlockDate: string
  unlockTime: string
  minDate: string
  saving: boolean
}

function pad(value: number): string { return value < 10 ? `0${value}` : `${value}` }
function dateValue(date: Date): string { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` }
function parseLocalDateTime(date: string, time: string): number {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute, 0, 0).getTime()
}

interface CreateCapsulePageMethods {
  onLoad(): void
  onUnload(): void
  onContentInput(event: WechatMiniprogram.Input): void
  onDateChange(event: WechatMiniprogram.PickerChange): void
  onTimeChange(event: WechatMiniprogram.PickerChange): void
  chooseImage(): void
  removeImage(): void
  cancel(): void
  submit(): Promise<void>
}

Page<CreateCapsulePageData, CreateCapsulePageMethods>({
  data: { pageTopPadding: getNavigationTopPadding(), actionInset: getNavigationActionInset(), content: '', imagePath: '', unlockDate: '', unlockTime: '09:00', minDate: '', saving: false },
  onLoad() {
    void getCapsuleServerTime().then((serverTime) => {
      const tomorrow = new Date(serverTime + 24 * 60 * 60 * 1000)
      this.setData({ minDate: dateValue(new Date(serverTime)), unlockDate: dateValue(tomorrow) })
    })
  },
  onUnload() {},
  onContentInput(event) { this.setData({ content: event.detail.value || '' }) },
  onDateChange(event) {
    const value = event.detail.value
    if (typeof value === 'string') this.setData({ unlockDate: value })
  },
  onTimeChange(event) {
    const value = event.detail.value
    if (typeof value === 'string') this.setData({ unlockTime: value })
  },
  chooseImage() {
    wx.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'], success: (result) => this.setData({ imagePath: result.tempFilePaths[0] || '' }) })
  },
  removeImage() { this.setData({ imagePath: '' }) },
  cancel() {
    if (this.data.content || this.data.imagePath) {
      wx.showModal({ title: '放弃这枚胶囊？', content: '还没有封存的内容会消失。', confirmText: '继续编辑', cancelText: '放弃', success: (result) => { if (!result.confirm) wx.navigateBack() } })
    } else wx.navigateBack()
  },
  async submit() {
    if (this.data.saving) return
    const unlockAt = parseLocalDateTime(this.data.unlockDate, this.data.unlockTime)
    const serverNow = await getCapsuleServerTime()
    if (!Number.isFinite(unlockAt) || unlockAt <= serverNow) {
      wx.showToast({ title: '请选择未来的时间', icon: 'none' })
      return
    }
    this.setData({ saving: true })
    try {
      await createCapsule({ content: this.data.content.trim() || undefined, imageId: this.data.imagePath || undefined, unlockAt })
      wx.showToast({ title: '已经替你保管好了', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 350)
    } catch (error) {
      const message = error instanceof Error ? error.message : '暂时无法封存，再试一次'
      wx.showToast({ title: message, icon: 'none' })
      this.setData({ saving: false })
    }
  }
})
