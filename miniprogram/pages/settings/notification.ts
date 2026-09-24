import { getCurrentNotificationSetting, updateCurrentNotificationSetting } from '../../services/notification-setting-service'
import type { NotificationSetting, NotificationSettingPatch } from '../../types'
import { getNavigationTopPadding } from '../../utils/navigation'

type ToggleKey = 'signalEnabled' | 'responseEnabled' | 'quietHoursEnabled'
type TimeKey = 'quietStart' | 'quietEnd'

interface ToggleEvent {
  currentTarget: { dataset: { setting: ToggleKey } }
}

interface TimePickerEvent {
  currentTarget: { dataset: { setting: TimeKey } }
  detail: { value: string | number[] | [string, string, string] }
}

interface NotificationSettingsPageData {
  pageTopPadding: number
  setting: NotificationSetting | null
  loading: boolean
  loadError: boolean
  saving: boolean
}

interface NotificationSettingsPageMethods {
  onShow(): void
  loadSetting(): Promise<void>
  toggleSetting(event: ToggleEvent): Promise<void>
  changeTime(event: TimePickerEvent): Promise<void>
  savePatch(patch: NotificationSettingPatch): Promise<void>
  handleBack(): void
}

Page<NotificationSettingsPageData, NotificationSettingsPageMethods>({
  data: { pageTopPadding: getNavigationTopPadding(), setting: null, loading: true, loadError: false, saving: false },
  onShow() { void this.loadSetting() },
  async loadSetting() {
    this.setData({ loading: true, loadError: false })
    try {
      const setting = await getCurrentNotificationSetting()
      this.setData({ setting, loading: false })
    } catch {
      this.setData({ loading: false, loadError: true })
    }
  },
  async toggleSetting(event) {
    const setting = this.data.setting
    if (!setting || this.data.saving) return
    const key = event.currentTarget.dataset.setting
    await this.savePatch({ [key]: !setting[key] })
  },
  async changeTime(event) {
    if (this.data.saving || typeof event.detail.value !== 'string') return
    const key = event.currentTarget.dataset.setting
    await this.savePatch({ [key]: event.detail.value })
  },
  async savePatch(patch) {
    if (this.data.saving) return
    this.setData({ saving: true })
    try {
      const setting = await updateCurrentNotificationSetting(patch)
      this.setData({ setting, saving: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : '设置还没有保存，请再试一次'
      wx.showToast({ title: message, icon: 'none' })
      this.setData({ saving: false })
    }
  },
  handleBack() { wx.navigateBack() }
})
