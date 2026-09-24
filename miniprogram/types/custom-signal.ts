export interface CustomSignal {
  id: string
  relationshipId: string
  emoji: string
  name: string
  meaning: string
  createdBy: string
  createdAt: number
  updatedAt: number
  enabled: boolean
}

export interface CreateCustomSignalInput {
  relationshipId: string
  emoji: string
  name: string
  meaning: string
  createdBy: string
}

export interface UpdateCustomSignalInput {
  emoji: string
  name: string
  meaning: string
}
