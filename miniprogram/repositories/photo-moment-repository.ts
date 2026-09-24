import type { CreatePhotoMomentInput, PhotoMoment } from '../types'

export interface PhotoMomentRepository {
  uploadImage(localFilePath: string): Promise<string>
  createPhotoMoment(input: CreatePhotoMomentInput): Promise<PhotoMoment>
  deleteRelationshipData(relationshipId: string): Promise<void>
}
