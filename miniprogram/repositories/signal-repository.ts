import type { CreateSignalInput, DeferredSignal, Signal, SignalResponse, SignalResponseType } from '../types'

export interface SignalRepository {
  createSignal(input: CreateSignalInput): Promise<Signal>
  retrySignal(id: string): Promise<Signal>
  getSignal(id: string): Promise<Signal | null>
  getInbox(userId: string): Promise<Signal[]>
  getSent(userId: string): Promise<Signal[]>
  getTimeline(relationshipId: string, cursor?: string, limit?: number): Promise<Signal[]>
  getResponse(signalId: string): Promise<SignalResponse | null>
  respond(signalId: string, type: SignalResponseType): Promise<SignalResponse>
  deferSignal(input: CreateSignalInput): Promise<DeferredSignal>
  deleteRelationshipData(relationshipId: string): Promise<void>
}
