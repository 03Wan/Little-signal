import type { CreatePhotoMomentInput, PhotoMoment } from '../../types'
import type { PhotoMomentRepository } from '../photo-moment-repository'

const moments: PhotoMoment[] = []
let nextId = 1
let failNextUpload = false

export const mockPhotoMomentRepository: PhotoMomentRepository = {
  async uploadImage(localFilePath) {
    if (!localFilePath) throw new Error('Photo file is missing')
    await Promise.resolve()
    if (failNextUpload) {
      failNextUpload = false
      throw new Error('Mock photo upload failed')
    }
    return `mock://photo/${nextId}/${encodeURIComponent(localFilePath.split(/[\\/]/).pop() ?? 'photo')}`
  },
  async createPhotoMoment(input: CreatePhotoMomentInput) {
    const now = Date.now()
    const moment: PhotoMoment = {
      id: `mock-photo-moment-${nextId++}`,
      ...input,
      createdAt: now,
      expiresAt: input.expireType === '24h' ? now + 24 * 60 * 60 * 1000 : undefined,
      status: 'active'
    }
    moments.push(moment)
    return { ...moment }
  },
  async deleteRelationshipData(relationshipId): Promise<void> {
    for (let index = moments.length - 1; index >= 0; index -= 1) {
      if (moments[index].relationshipId === relationshipId) moments.splice(index, 1)
    }
  }
}

export function getMockPhotoMoments(): PhotoMoment[] {
  return moments.map((moment) => ({ ...moment }))
}

export function clearMockPhotoMoments(): void {
  moments.length = 0
  nextId = 1
  failNextUpload = false
}

export function setMockNextPhotoUploadFailure(shouldFail = true): void {
  failNextUpload = shouldFail
}
