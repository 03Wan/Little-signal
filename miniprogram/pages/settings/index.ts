import { getNavigationTopPadding } from '../../utils/navigation'

interface SettingsPageMethods {
  handleBack(): void
  openNotification(): void
  openPrivacy(): void
  openRelationship(): void
  openAbout(): void
}

Page<{ pageTopPadding: number }, SettingsPageMethods>({
  data: { pageTopPadding: getNavigationTopPadding() },
  handleBack() { wx.navigateBack() },
  openNotification() { wx.navigateTo({ url: '/pages/settings/notification' }) },
  openPrivacy() { wx.navigateTo({ url: '/pages/privacy/index' }) },
  openRelationship() { wx.navigateTo({ url: '/pages/relationship/index' }) },
  openAbout() {
    wx.showModal({
      title: '关于小信号',
      content: '有些时候，不是想聊天，只是突然想到了一个人。',
      showCancel: false
    })
  }
})
