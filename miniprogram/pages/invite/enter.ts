import { getCurrentMockUser, isDevelopmentEnvironment, switchCurrentMockUser } from '../../services/signal-service'
import { getInvitePreview } from '../../services/relationship-service'
import type { MockUser, RelationshipInvitePreview } from '../../types'

interface InviteEnterPageData {
  code: string
  preview: RelationshipInvitePreview | null
  isExpired: boolean
  isDevelopment: boolean
  currentUser: MockUser
  isChecking: boolean
  errorMessage: string
}

interface InviteEnterPageMethods {
  handleCodeInput(event: { detail: { value: string } }): void
  checkInvite(): Promise<void>
  regenerateInvite(): void
  switchMockUser(): void
  handleBack(): void
}

Page<InviteEnterPageData, InviteEnterPageMethods>({
  data: {
    code: '', preview: null, isExpired: false, isDevelopment: false,
    currentUser: getCurrentMockUser(), isChecking: false, errorMessage: ''
  },
  onLoad(query: { inviteCode?: string }) {
    this.setData({ isDevelopment: isDevelopmentEnvironment(), currentUser: getCurrentMockUser() })
    if (query.inviteCode) this.setData({ code: query.inviteCode.replace(/\s+/g, '').toUpperCase().slice(0, 6) })
  },
  onShow() {
    this.setData({ isDevelopment: isDevelopmentEnvironment(), currentUser: getCurrentMockUser() })
  },
  handleCodeInput(event) {
    const code = event.detail.value.replace(/\s+/g, '').toUpperCase().slice(0, 6)
    this.setData({ code, preview: null, isExpired: false, errorMessage: '' })
  },
  async checkInvite() {
    if (this.data.code.length !== 6 || this.data.isChecking) return
    this.setData({ isChecking: true, errorMessage: '' })
    try {
      const preview = await getInvitePreview(this.data.code)
      if (!preview) {
        this.setData({ preview: null, isExpired: false, errorMessage: '没有找到这个邀请码' })
        return
      }
      if (preview.invite.status === 'expired' || preview.invite.status === 'cancelled') {
        this.setData({ preview, isExpired: true, errorMessage: '邀请已经失效。' })
        return
      }
      if (preview.invite.status !== 'pending') {
        this.setData({ preview, isExpired: false, errorMessage: '这个邀请已经使用过了' })
        return
      }
      if (preview.invite.inviterId === getCurrentMockUser().id) {
        this.setData({ preview, isExpired: false, errorMessage: '请让另一位用户输入邀请码' })
        return
      }
      this.setData({ preview, isExpired: false })
      wx.navigateTo({ url: `/pages/invite/confirm?inviteCode=${encodeURIComponent(this.data.code)}` })
    } finally {
      this.setData({ isChecking: false })
    }
  },
  regenerateInvite() {
    wx.navigateTo({ url: '/pages/bind/index' })
  },
  switchMockUser() {
    if (!this.data.isDevelopment) return
    this.setData({ currentUser: switchCurrentMockUser() })
  },
  handleBack() {
    wx.navigateBack({ delta: 1, fail: () => wx.redirectTo({ url: '/pages/bind/index' }) })
  }
})
