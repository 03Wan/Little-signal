import { relationshipMock } from '../../repositories/mock/visual-master'
import { getNavigationTopPadding } from '../../utils/navigation'

Page({
  data: { ...relationshipMock, pageTopPadding: getNavigationTopPadding() },
  onShow() {
    this.getTabBar().setData({ selectedKey: 'us', hidden: false })
  },
  openCustomSignals() {
    wx.navigateTo({ url: '/pages/code/index' })
  },
  openCapsules() {
    wx.navigateTo({ url: '/pages/capsule/index' })
  },
  openNotificationSettings() {
    wx.navigateTo({ url: '/pages/settings/notification' })
  },
  openPrivacy() {
    wx.navigateTo({ url: '/pages/privacy/index' })
  },
  openRelationshipSettings() {
    wx.navigateTo({ url: '/pages/relationship/index' })
  },
  openAbout() {
    wx.showModal({
      title: '关于小信号',
      content: '有些时候，不是想聊天，只是突然想到了一个人。',
      showCancel: false
    })
  }
})
