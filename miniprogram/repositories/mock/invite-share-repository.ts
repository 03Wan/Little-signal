import type { InviteSharePayload } from '../../types'

let latestPayload: InviteSharePayload | null = null

export interface InviteShareRepository {
  createSharePayload(inviteCode: string, expiresAt: number): Promise<InviteSharePayload>
}

export const mockInviteShareRepository: InviteShareRepository = {
  async createSharePayload(inviteCode, expiresAt): Promise<InviteSharePayload> {
    const payload: InviteSharePayload = {
      title: '给你一个小信号邀请',
      path: `/pages/invite/enter?inviteCode=${encodeURIComponent(inviteCode)}`,
      inviteCode,
      expiresAt
    }
    latestPayload = { ...payload }
    return { ...payload }
  }
}

export function getLatestMockInviteShare(): InviteSharePayload | null {
  return latestPayload ? { ...latestPayload } : null
}
