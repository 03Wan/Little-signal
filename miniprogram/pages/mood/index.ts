import { clearCurrentUserMood, getCurrentUserMood, MOOD_OPTIONS, setCurrentUserMood } from '../../services/mood-service'
import type { Mood, MoodPresentation, MoodType } from '../../types'
import { getNavigationTopPadding } from '../../utils/navigation'

interface MoodPageData {
  pageTopPadding: number
  options: MoodPresentation[]
  currentMood: Mood | null
  customLabel: string
  customDraft: string
  customSheetOpen: boolean
  selectedType: MoodType | ''
  isSaving: boolean
}

interface MoodPageMethods {
  refreshMood(): Promise<void>
  selectMood(event: { currentTarget: { dataset: { type: MoodType } } }): Promise<void>
  clearMood(): Promise<void>
  openCustomSheet(): void
  closeCustomSheet(): void
  handleCustomInput(event: { detail: { value: string } }): void
  saveCustomMood(): Promise<void>
  handleBack(): void
}

const backTimers = new WeakMap<object, number>()

Page<MoodPageData, MoodPageMethods>({
  data: {
    pageTopPadding: getNavigationTopPadding(),
    options: MOOD_OPTIONS,
    currentMood: null,
    customLabel: '',
    customDraft: '',
    customSheetOpen: false,
    selectedType: '',
    isSaving: false
  },
  onShow() {
    void this.refreshMood()
  },
  onUnload() {
    const timer = backTimers.get(this)
    if (timer !== undefined) clearTimeout(timer)
    backTimers.delete(this)
  },
  async refreshMood() {
    const currentMood = await getCurrentUserMood()
    this.setData({ currentMood, selectedType: currentMood?.type ?? '', customLabel: currentMood?.customLabel ?? '' })
  },
  async selectMood(event) {
    if (this.data.isSaving) return
    const type = event.currentTarget.dataset.type
    if (!MOOD_OPTIONS.some((option) => option.type === type)) return
    this.setData({ isSaving: true, selectedType: type })
    try {
      const currentMood = await setCurrentUserMood(type)
      this.setData({ currentMood })
      wx.showToast({ title: '今天的状态已更新', icon: 'none', duration: 800 })
      const timer = setTimeout(() => {
        backTimers.delete(this)
        wx.navigateBack({ delta: 1 })
      }, 500)
      backTimers.set(this, timer)
    } catch {
      this.setData({ selectedType: this.data.currentMood?.type ?? '' })
      wx.showToast({ title: '状态还没有更新', icon: 'none' })
      this.setData({ isSaving: false })
    }
  },
  async clearMood() {
    if (this.data.isSaving) return
    this.setData({ isSaving: true, selectedType: '' })
    try {
      await clearCurrentUserMood()
      this.setData({ currentMood: null })
      wx.showToast({ title: '今天的状态已清除', icon: 'none', duration: 800 })
      const timer = setTimeout(() => {
        backTimers.delete(this)
        wx.navigateBack({ delta: 1 })
      }, 500)
      backTimers.set(this, timer)
    } catch {
      this.setData({ selectedType: this.data.currentMood?.type ?? '' })
      wx.showToast({ title: '状态还没有更新', icon: 'none' })
      this.setData({ isSaving: false })
    }
  },
  openCustomSheet() {
    if (this.data.isSaving) return
    this.setData({ customDraft: this.data.currentMood?.type === 'custom' ? this.data.currentMood.customLabel ?? '' : '', customSheetOpen: true })
  },
  closeCustomSheet() {
    if (!this.data.isSaving) this.setData({ customSheetOpen: false })
  },
  handleCustomInput(event) {
    this.setData({ customDraft: event.detail.value || '' })
  },
  async saveCustomMood() {
    if (this.data.isSaving) return
    const customLabel = this.data.customDraft.trim()
    if (!customLabel) {
      wx.showToast({ title: '请输入状态内容', icon: 'none' })
      return
    }
    if (customLabel.length > 12) {
      wx.showToast({ title: '状态最多 12 个字', icon: 'none' })
      return
    }
    this.setData({ isSaving: true, selectedType: 'custom' })
    try {
      const currentMood = await setCurrentUserMood('custom', customLabel)
      this.setData({ currentMood, customLabel, customSheetOpen: false })
      wx.showToast({ title: '今天的状态已更新', icon: 'none', duration: 800 })
      const timer = setTimeout(() => {
        backTimers.delete(this)
        wx.navigateBack({ delta: 1 })
      }, 500)
      backTimers.set(this, timer)
    } catch {
      this.setData({ selectedType: this.data.currentMood?.type ?? '', isSaving: false })
      wx.showToast({ title: '状态还没有更新', icon: 'none' })
    }
  },
  handleBack() {
    wx.navigateBack({ delta: 1 })
  }
})
