import { sendSignal, createInputForCurrentUser } from '../../services/signal-service'
import { uploadAndCreatePhotoMoment } from '../../services/photo-moment-service'
import { SIGNAL_OPTIONS } from '../../utils/signals'
import { getNavigationActionInset, getNavigationTopPadding } from '../../utils/navigation'
import type { MomentExpireType, PhotoMoment, PhotoUploadStatus, SignalType } from '../../types'

interface PhotoSignalOption { type: SignalType; label: string; icon: string }
interface PhotoMomentPageData {
  pageTopPadding: number
  actionInset: number
  imagePath: string
  caption: string
  captionCount: number
  signalType: SignalType
  signalOptions: PhotoSignalOption[]
  expireType: MomentExpireType
  expireOptions: Array<{ type: MomentExpireType; label: string }>
  uploadStatus: PhotoUploadStatus
  sendStatus: 'idle' | 'sending' | 'failed' | 'sent'
  permissionDenied: boolean
  uploadedMomentId: string
  savedMoment: PhotoMoment | null
}
interface PhotoMomentPageMethods {
  choosePhoto(): void
  previewPhoto(): void
  handleCaptionInput(event: WechatMiniprogram.Input): void
  selectSignal(event: WechatMiniprogram.TouchEvent): void
  selectExpireType(event: WechatMiniprogram.TouchEvent): void
  sendPhotoSignal(): Promise<void>
  retryPhotoSignal(): Promise<void>
  authorizeAlbum(): void
  leavePermissionPage(): void
  cancelPage(): void
  returnAfterSend(): void
}

function truncateCaption(value: string): string {
  return Array.from(value).slice(0, 20).join('')
}

function isPermissionError(error: WechatMiniprogram.GeneralCallbackResult): boolean {
  const message = error.errMsg.toLowerCase()
  return /auth deny|authorize|permission|scope\.album|scope\.camera/.test(message)
}

function isCancelled(error: WechatMiniprogram.GeneralCallbackResult): boolean {
  return /cancel/i.test(error.errMsg)
}

Page<PhotoMomentPageData, PhotoMomentPageMethods>({
  data: {
    pageTopPadding: getNavigationTopPadding(),
    actionInset: getNavigationActionInset(),
    imagePath: '',
    caption: '',
    captionCount: 0,
    signalType: 'thinking_of_you',
    signalOptions: SIGNAL_OPTIONS.map(({ type, label, icon }) => ({ type, label, icon })),
    expireType: 'permanent',
    expireOptions: [
      { type: 'permanent', label: '永久' },
      { type: '24h', label: '24 小时' },
      { type: 'once', label: '查看一次' }
    ],
    uploadStatus: 'idle',
    sendStatus: 'idle',
    permissionDenied: false,
    uploadedMomentId: '',
    savedMoment: null
  },
  choosePhoto() {
    if (this.data.uploadStatus === 'uploading' || this.data.uploadedMomentId || this.data.sendStatus === 'sent') return
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed', 'original'],
      success: (result) => {
        const file = result.tempFiles[0]
        if (!file) return
        this.setData({ imagePath: file.tempFilePath, uploadStatus: 'idle', sendStatus: 'idle', permissionDenied: false })
      },
      fail: (error) => {
        if (isCancelled(error)) return
        if (isPermissionError(error)) {
          this.setData({ permissionDenied: true })
          return
        }
        wx.showToast({ title: '暂时无法选择这张照片', icon: 'none' })
      }
    })
  },
  previewPhoto() {
    if (!this.data.imagePath) return
    wx.previewImage({ current: this.data.imagePath, urls: [this.data.imagePath] })
  },
  handleCaptionInput(event) {
    const caption = truncateCaption(event.detail.value)
    this.setData({ caption, captionCount: Array.from(caption).length })
  },
  selectSignal(event) {
    if (this.data.uploadedMomentId || this.data.uploadStatus === 'uploading') return
    this.setData({ signalType: event.currentTarget.dataset.type as SignalType })
  },
  selectExpireType(event) {
    if (this.data.uploadedMomentId || this.data.uploadStatus === 'uploading') return
    this.setData({ expireType: event.currentTarget.dataset.type as MomentExpireType })
  },
  async sendPhotoSignal() {
    if (this.data.sendStatus === 'sending' || this.data.sendStatus === 'sent' || this.data.uploadStatus === 'uploading') return
    if (!this.data.imagePath) {
      wx.showToast({ title: '先选择一张照片', icon: 'none' })
      return
    }
    if (!this.data.uploadedMomentId) {
      this.setData({ uploadStatus: 'uploading', sendStatus: 'idle' })
      try {
        const signalInput = createInputForCurrentUser('photo', false)
        const moment = await uploadAndCreatePhotoMoment({
          relationshipId: signalInput.relationshipId,
          senderId: signalInput.senderId,
          receiverId: signalInput.receiverId,
          localFilePath: this.data.imagePath,
          caption: this.data.caption,
          signalType: this.data.signalType,
          expireType: this.data.expireType
        })
        this.setData({ uploadStatus: 'uploaded', uploadedMomentId: moment.id, savedMoment: moment })
      } catch {
        this.setData({ uploadStatus: 'failed' })
        wx.showToast({ title: '照片还没有上传，内容已保留', icon: 'none' })
        return
      }
    }

    this.setData({ sendStatus: 'sending' })
    try {
      await sendSignal({
        ...createInputForCurrentUser('photo', false),
        imageId: this.data.uploadedMomentId,
        message: this.data.caption
      })
      this.setData({ sendStatus: 'sent' })
    } catch {
      this.setData({ sendStatus: 'failed' })
      wx.showToast({ title: '照片已经准备好，但信号还没有送出去', icon: 'none' })
    }
  },
  async retryPhotoSignal() {
    await this.sendPhotoSignal()
  },
  authorizeAlbum() {
    wx.openSetting({
      success: () => {
        this.setData({ permissionDenied: false })
        this.choosePhoto()
      },
      fail: () => wx.showToast({ title: '暂时无法打开授权设置', icon: 'none' })
    })
  },
  leavePermissionPage() {
    this.setData({ permissionDenied: false })
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/home/index' }) })
  },
  cancelPage() {
    const hasDraft = Boolean(this.data.imagePath || this.data.caption || this.data.expireType !== 'permanent' || this.data.signalType !== 'thinking_of_you')
    if (!hasDraft || this.data.sendStatus === 'sent') {
      wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/home/index' }) })
      return
    }
    wx.showModal({
      title: '离开照片信号？',
      content: '离开后，这张照片和填写内容会被清除。',
      confirmText: '离开',
      cancelText: '继续编辑',
      success: (result) => {
        if (result.confirm) wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/home/index' }) })
      }
    })
  },
  returnAfterSend() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/home/index' }) })
  }
})
