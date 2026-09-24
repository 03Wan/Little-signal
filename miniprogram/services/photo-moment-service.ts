import { mockPhotoMomentRepository } from '../repositories/mock/index'
import type { CreatePhotoMomentInput, PhotoMoment } from '../types'

export async function uploadAndCreatePhotoMoment(input: Omit<CreatePhotoMomentInput, 'storagePath'> & { localFilePath: string }): Promise<PhotoMoment> {
  const storagePath = await mockPhotoMomentRepository.uploadImage(input.localFilePath)
  const { localFilePath: _localFilePath, ...momentInput } = input
  return mockPhotoMomentRepository.createPhotoMoment({ ...momentInput, storagePath })
}
