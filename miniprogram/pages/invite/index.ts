import { getCurrentMockUser, isDevelopmentEnvironment, switchCurrentMockUser } from '../../services/signal-service'
import { createRelationshipInvite, getCurrentActiveRelationship, getRelationshipInvite } from '../../services/relationship-service'
import { prepareInviteShare } from '../../services/invite-share-service'
import type { MockUser, RelationshipInvite } from '../../types'

interface QrCell { id: number; dark: boolean }
interface QrRow { id: number; cells: QrCell[] }

interface InvitePageData {
  invite: RelationshipInvite | null
  inviteCodeDisplay: string
  expirationLabel: string
  qrRows: QrRow[]
  isExpired: boolean
  isDevelopment: boolean
  currentUser: MockUser
  isBusy: boolean
}

interface InvitePageMethods {
  loadInvite(inviteId: string): Promise<void>
  copyInviteCode(): void
  shareInvite(): Promise<void>
  regenerateInvite(): Promise<void>
  switchMockUser(): void
  openCodeEntry(): void
  returnToBind(): void
}

function formatExpiration(timestamp: number): string {
  const date = new Date(timestamp)
  const pad = (value: number) => `${value}`.padStart(2, '0')
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function makeQrPreview(code: string): QrRow[] {
  const size = 21
  const isFinderModule = (row: number, column: number): boolean | null => {
    const origins = [[0, 0], [0, size - 7], [size - 7, 0]]
    for (const [originRow, originColumn] of origins) {
      const localRow = row - originRow
      const localColumn = column - originColumn
      if (localRow < 0 || localRow > 6 || localColumn < 0 || localColumn > 6) continue
      return localRow === 0 || localRow === 6 || localColumn === 0 || localColumn === 6 || (localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4)
    }
    return null
  }
  return Array.from({ length: size }, (_row, row) => ({
    id: row,
    cells: Array.from({ length: size }, (_cell, column) => {
      const finder = isFinderModule(row, column)
      const codePoint = code.charCodeAt((row * size + column) % Math.max(1, code.length)) || 0
      return { id: column, dark: finder ?? ((row * 17 + column * 31 + codePoint) % 7 < 3) }
    })
  }))
}

Page<InvitePageData, InvitePageMethods>({
  data: {
    invite: null,
    inviteCodeDisplay: '',
    expirationLabel: '',
    qrRows: makeQrPreview('MOCK'),
    isExpired: false,
    isDevelopment: false,
    currentUser: getCurrentMockUser(),
    isBusy: false
  },
  onLoad(query: { inviteId?: string }) {
    this.setData({ isDevelopment: isDevelopmentEnvironment(), currentUser: getCurrentMockUser() })
    if (query.inviteId) void this.loadInvite(query.inviteId)
  },
  onShow() {
    this.setData({ isDevelopment: isDevelopmentEnvironment(), currentUser: getCurrentMockUser() })
    const inviteId = this.data.invite?.id
    if (inviteId) void this.loadInvite(inviteId)
  },
  async loadInvite(inviteId) {
    const invite = await getRelationshipInvite(inviteId)
    if (!invite) {
      wx.showToast({ title: '邀请没有找到', icon: 'none' })
      return
    }
    if (invite.status === 'accepted') {
      const relationship = await getCurrentActiveRelationship()
      if (relationship) wx.redirectTo({ url: `/pages/bind-success/index?relationshipId=${relationship.id}` })
    }
    this.setData({
      invite,
      inviteCodeDisplay: invite.inviteCode.split('').join(' '),
      expirationLabel: formatExpiration(invite.expiresAt),
      qrRows: makeQrPreview(invite.inviteCode),
      isExpired: invite.status === 'expired' || invite.status === 'cancelled'
    })
  },
  copyInviteCode() {
    const inviteCode = this.data.invite?.inviteCode
    if (!inviteCode) return
    wx.setClipboardData({ data: inviteCode, success: () => wx.showToast({ title: '邀请码已复制', icon: 'none' }) })
  },
  async shareInvite() {
    const invite = this.data.invite
    if (!invite || invite.status !== 'pending' || invite.expiresAt <= Date.now()) return
    const payload = await prepareInviteShare(invite.inviteCode, invite.expiresAt)
    wx.showToast({ title: `Mock 分享已准备 · ${payload.inviteCode}`, icon: 'none', duration: 2200 })
  },
  async regenerateInvite() {
    if (this.data.isBusy) return
    this.setData({ isBusy: true })
    try {
      const invite = await createRelationshipInvite()
      await this.loadInvite(invite.id)
    } catch {
      wx.showToast({ title: '邀请还没有创建成功', icon: 'none' })
    } finally {
      this.setData({ isBusy: false })
    }
  },
  switchMockUser() {
    if (!this.data.isDevelopment) return
    this.setData({ currentUser: switchCurrentMockUser() })
  },
  openCodeEntry() {
    if (!this.data.isDevelopment) return
    wx.navigateTo({ url: '/pages/invite/enter' })
  },
  returnToBind() {
    wx.navigateBack({ delta: 1, fail: () => wx.redirectTo({ url: '/pages/bind/index' }) })
  }
})
