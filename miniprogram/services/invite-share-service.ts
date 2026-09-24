import { mockInviteShareRepository } from '../repositories/mock/index'
import type { InviteSharePayload } from '../types'

export function prepareInviteShare(inviteCode: string, expiresAt: number): Promise<InviteSharePayload> {
  return mockInviteShareRepository.createSharePayload(inviteCode, expiresAt)
}
