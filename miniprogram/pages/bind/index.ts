import { getCurrentMockUser, isDevelopmentEnvironment, switchCurrentMockUser } from '../../services/signal-service'
import { createRelationshipInvite, getCurrentActiveRelationship } from '../../services/relationship-service'
import type { MockUser } from '../../types'

interface BindPageData {
  isDevelopment: boolean
  currentUser: MockUser
  isBusy: boolean
}

interface BindPageMethods {
  createConnection(): Promise<void>
  enterInviteCode(): void
  switchMockUser(): void
  handleBack(): void
}

Page<BindPageData, BindPageMethods>({
  data: { isDevelopment: false, currentUser: getCurrentMockUser(), isBusy: false },
  onShow() {
    this.setData({ isDevelopment: isDevelopmentEnvironment(), currentUser: getCurrentMockUser() })
    void getCurrentActiveRelationship().then((relationship) => {
      if (relationship) wx.redirectTo({ url: `/pages/bind-success/index?relationshipId=${relationship.id}` })
    })
  },
  async createConnection() {
    if (this.data.isBusy) return
    this.setData({ isBusy: true })
    try {
      const invite = await createRelationshipInvite()
      wx.navigateTo({ url: `/pages/invite/index?inviteId=${invite.id}` })
    } catch {
      wx.showToast({ title: '邀请还没有创建成功', icon: 'none' })
    } finally {
      this.setData({ isBusy: false })
    }
  },
  enterInviteCode() {
    wx.navigateTo({ url: '/pages/invite/enter' })
  },
  switchMockUser() {
    if (!this.data.isDevelopment) return
    this.setData({ currentUser: switchCurrentMockUser() })
  },
  handleBack() {
    wx.navigateBack({ delta: 1, fail: () => wx.redirectTo({ url: '/pages/unbound/index' }) })
  }
})
