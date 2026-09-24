import { getCurrentMockUser, isDevelopmentEnvironment, switchCurrentMockUser } from '../../services/signal-service'
import { acceptRelationshipInvite, getInvitePreview } from '../../services/relationship-service'
import type { MockUser, RelationshipInvitePreview } from '../../types'

interface InviteConfirmPageData {
  inviteCode: string
  preview: RelationshipInvitePreview | null
  expiresAtLabel: string
  isExpired: boolean
  isUsable: boolean
  isDevelopment: boolean
  currentUser: MockUser
  isAccepting: boolean
  errorMessage: string
}

interface InviteConfirmPageMethods {
  loadPreview(inviteCode: string): Promise<void>
  acceptInvite(): Promise<void>
  regenerateInvite(): void
  switchMockUser(): void
  handleBack(): void
}

Page<InviteConfirmPageData, InviteConfirmPageMethods>({
  data: {
    inviteCode: '', preview: null, expiresAtLabel: '', isExpired: false, isUsable: false, isDevelopment: false,
    currentUser: getCurrentMockUser(), isAccepting: false, errorMessage: ''
  },
  onLoad(query: { inviteCode?: string }) {
    const inviteCode = (query.inviteCode ?? '').replace(/\s+/g, '').toUpperCase()
    this.setData({ inviteCode, isDevelopment: isDevelopmentEnvironment(), currentUser: getCurrentMockUser() })
    if (inviteCode) void this.loadPreview(inviteCode)
  },
  onShow() {
    this.setData({ isDevelopment: isDevelopmentEnvironment(), currentUser: getCurrentMockUser() })
  },
  async loadPreview(inviteCode) {
    const preview = await getInvitePreview(inviteCode)
    const isExpired = !preview || preview.invite.status === 'expired' || preview.invite.status === 'cancelled'
    const isUsable = preview?.invite.status === 'pending' && preview.invite.expiresAt > Date.now()
    this.setData({
      preview,
      expiresAtLabel: preview ? formatExpiration(preview.invite.expiresAt) : '',
      isExpired,
      isUsable: Boolean(isUsable),
      errorMessage: isExpired ? '邀请已经失效。' : (!isUsable ? '这个邀请已经使用过了' : '')
    })
  },
  async acceptInvite() {
    if (this.data.isAccepting || !this.data.preview || this.data.isExpired) return
    this.setData({ isAccepting: true, errorMessage: '' })
    try {
      const relationship = await acceptRelationshipInvite(this.data.inviteCode)
      wx.redirectTo({ url: `/pages/bind-success/index?relationshipId=${relationship.id}` })
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (message.toLowerCase().includes('expired')) {
        await this.loadPreview(this.data.inviteCode)
        this.setData({ errorMessage: '邀请已经失效。', isExpired: true })
      } else if (message.includes('active relationship')) {
        this.setData({ errorMessage: '你或邀请人已经建立连接。' })
      } else {
        this.setData({ errorMessage: '暂时无法确认邀请，请稍后重试。' })
      }
    } finally {
      this.setData({ isAccepting: false })
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
    wx.navigateBack({ delta: 1, fail: () => wx.redirectTo({ url: '/pages/invite/enter' }) })
  }
})

function formatExpiration(timestamp: number): string {
  const date = new Date(timestamp)
  const pad = (value: number) => `${value}`.padStart(2, '0')
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
