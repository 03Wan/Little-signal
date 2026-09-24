import { createCustomSignal, getCustomSignal, updateCustomSignal } from '../../services/custom-signal-service'
import type { CustomSignal } from '../../types'
const EMOJI_OPTIONS = ['☀', '☾', '☁', '♡', '⌂', '✿', '◎', '◌', '♧', '✦']
interface CustomSignalFormData { emojiOptions: string[]; emoji: string; name: string; meaning: string; editingId: string; pageTitle: string; saving: boolean }
interface CustomSignalFormMethods {
  onLoad(options: Record<string, string | undefined>): void; handleEmojiSelect(event: WechatMiniprogram.TouchEvent): void
  handleNameInput(event: WechatMiniprogram.Input): void; handleMeaningInput(event: WechatMiniprogram.Input): void; saveSignal(): Promise<void>
}
Page<CustomSignalFormData, CustomSignalFormMethods>({
  data: { emojiOptions: EMOJI_OPTIONS, emoji: EMOJI_OPTIONS[0], name: '', meaning: '', editingId: '', pageTitle: '创建暗号', saving: false },
  onLoad(options) {
    const id = options.id
    if (!id) return
    void getCustomSignal(id).then((signal: CustomSignal | null) => {
      if (!signal) { wx.showToast({ title: '暗号不存在', icon: 'none' }); wx.navigateBack(); return }
      this.setData({ emoji: signal.emoji, name: signal.name, meaning: signal.meaning, editingId: signal.id, pageTitle: '编辑暗号' })
      wx.setNavigationBarTitle({ title: '编辑暗号' })
    }).catch((error: unknown) => { wx.showToast({ title: error instanceof Error ? error.message : '读取失败', icon: 'none' }); wx.navigateBack() })
  },
  handleEmojiSelect(event) { this.setData({ emoji: event.currentTarget.dataset.emoji as string }) },
  handleNameInput(event) { this.setData({ name: event.detail.value }) },
  handleMeaningInput(event) { this.setData({ meaning: event.detail.value }) },
  async saveSignal() {
    const emoji = this.data.emoji.trim(), name = this.data.name.trim(), meaning = this.data.meaning.trim()
    if (!emoji || !name || !meaning) { wx.showToast({ title: '请填写图标、名称和真正含义', icon: 'none' }); return }
    if (this.data.saving) return
    this.setData({ saving: true })
    try {
      if (this.data.editingId) await updateCustomSignal(this.data.editingId, { emoji, name, meaning })
      else await createCustomSignal({ emoji, name, meaning })
      wx.navigateBack()
    } catch (error) { this.setData({ saving: false }); wx.showToast({ title: error instanceof Error ? error.message : '保存失败', icon: 'none' }) }
  }
})
