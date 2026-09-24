export type SignalType =
  | 'thinking_of_you'
  | 'hug'
  | 'tired'
  | 'happy'
  | 'home'
  | 'goodnight'
  | 'knock'
  | 'available'
  | 'custom'
  | 'photo'

export type SignalStatus = 'sending' | 'sent' | 'received' | 'responded' | 'failed' | 'deleted'

export interface Signal {
  id: string
  relationshipId: string
  senderId: string
  receiverId: string
  type: SignalType
  customSignalId?: string
  imageId?: string
  message?: string
  noReply: boolean
  silent: boolean
  createdAt: number
  receivedAt?: number
  status: SignalStatus
}

export interface CreateSignalInput {
  relationshipId: string
  senderId: string
  receiverId: string
  type: SignalType
  customSignalId?: string
  imageId?: string
  message?: string
  noReply: boolean
  silent?: boolean
}

export type SignalResponseType = 'received' | 'me_too' | 'hug' | 'later' | 'available_now' | 'busy'

export interface SignalResponse {
  id: string
  signalId: string
  relationshipId: string
  senderId: string
  receiverId: string
  type: SignalResponseType
  createdAt: number
}

export interface MockUser {
  id: string
  name: string
  role: 'A' | 'B'
}

export interface DeferredSignal {
  id: string
  input: CreateSignalInput
  createdAt: number
}
