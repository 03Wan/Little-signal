import type { SignalType } from './signal'

export type MomentExpireType = 'permanent' | '24h' | 'once'
export type MomentStatus = 'active' | 'expired' | 'deleted'
export type PhotoUploadStatus = 'idle' | 'uploading' | 'uploaded' | 'failed'

export interface PhotoMoment {
  id: string
  relationshipId: string
  senderId: string
  receiverId: string
  storagePath: string
  caption: string
  signalType: SignalType
  expireType: MomentExpireType
  createdAt: number
  expiresAt?: number
  viewedAt?: number
  status: MomentStatus
}

export interface CreatePhotoMomentInput {
  relationshipId: string
  senderId: string
  receiverId: string
  storagePath: string
  caption: string
  signalType: SignalType
  expireType: MomentExpireType
}
