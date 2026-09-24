import { getMockPartner } from '../../repositories/mock/index'
import { getCustomSignal } from '../../services/custom-signal-service'
import { getCurrentMockUser, getInbox, getSignal, getSignalResponse, isDevelopmentEnvironment, respondToSignal, switchCurrentMockUser } from '../../services/signal-service'
import type { MockUser, Signal, SignalResponseType } from '../../types'
import { SIGNAL_OPTIONS } from '../../utils/signals'
import { getNavigationActionInset, getNavigationTopPadding } from '../../utils/navigation'

interface SignalDetailData {
  pageTopPadding: number
  actionInset: number
  isDevelopment: boolean
  currentUser: MockUser
  signal: Signal | null
  senderName: string
  signalMessage: string
  timeLabel: string
  responseLabel: string
  isReceiver: boolean
  toastVisible: boolean
  toastMessage: string
  isResponding: boolean
}

interface SignalDetailMethods {
  loadSignal(signalId?: string): Promise<void>
  handleResponse(event: { currentTarget: { dataset: { type: SignalResponseType } } }): Promise<void>
  switchMockUser(): void
  closeToast(): void
  returnHome(): void
}

const responseLabels: Record<SignalResponseType, string> = {
  received: '接住了',
  me_too: '我也在',
  hug: '抱一下',
  later: '稍后回应',
  available_now: '现在有空',
  busy: '现在不方便'
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const pad = (value: number) => `${value}`.padStart(2, '0')
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

Page<SignalDetailData, SignalDetailMethods>({
  data: {
    pageTopPadding: getNavigationTopPadding(),
    actionInset: getNavigationActionInset(),
    isDevelopment: false,
    currentUser: getCurrentMockUser(),
    signal: null,
    senderName: '',
    signalMessage: '',
    timeLabel: '',
    responseLabel: '',
    isReceiver: false,
    toastVisible: false,
    toastMessage: '',
    isResponding: false
  },
  onLoad(query: { signalId?: string }) {
    this.setData({ isDevelopment: isDevelopmentEnvironment(), currentUser: getCurrentMockUser() })
    void this.loadSignal(query.signalId)
  },
  onShow() {
    this.setData({ isDevelopment: isDevelopmentEnvironment(), currentUser: getCurrentMockUser() })
  },
  async loadSignal(signalId) {
    const currentUser = getCurrentMockUser()
    const inbox = signalId ? [] : await getInbox(currentUser.id)
    const signal = (signalId ? await getSignal(signalId) : inbox[0]) ?? null
    if (!signal) {
      this.setData({ signal: null, senderName: '', signalMessage: '', timeLabel: '', responseLabel: '', isReceiver: false })
      return
    }
    const customSignal = signal.customSignalId ? await getCustomSignal(signal.customSignalId).catch(() => null) : null
    const signalOption = SIGNAL_OPTIONS.find((option) => option.type === signal.type)
    const response = signal.status === 'responded' ? await getSignalResponse(signal.id) : null
    this.setData({
      currentUser,
      signal,
      senderName: signal.senderId === currentUser.id ? currentUser.name : getMockPartner(currentUser.id).name,
      signalMessage: signal.type === 'thinking_of_you' ? '刚刚想到了你' : customSignal?.name ?? signalOption?.pickerLabel ?? '给你一个小信号',
      timeLabel: formatTime(signal.createdAt),
      responseLabel: response ? responseLabels[response.type] : '',
      isReceiver: signal.receiverId === currentUser.id
    })
  },
  async handleResponse(event) {
    const signal = this.data.signal
    if (!signal || !this.data.isReceiver || signal.noReply || signal.status !== 'received' || this.data.isResponding) return
    const type = event.currentTarget.dataset.type
    if (!type) return
    this.setData({ isResponding: true })
    try {
      await respondToSignal(signal.id, type)
      this.setData({
        signal: { ...signal, status: 'responded' },
        responseLabel: responseLabels[type],
        toastVisible: true,
        toastMessage: '已经接住了'
      })
      wx.vibrateShort({ type: 'light' })
    } catch {
      this.setData({ toastVisible: true, toastMessage: '回应还没有送出去' })
    } finally {
      this.setData({ isResponding: false })
    }
  },
  switchMockUser() {
    if (!isDevelopmentEnvironment()) return
    const currentUser = switchCurrentMockUser()
    this.setData({ currentUser, isReceiver: false })
    void this.loadSignal()
  },
  closeToast() {
    this.setData({ toastVisible: false })
  },
  returnHome() {
    wx.switchTab({ url: '/pages/home/index' })
  }
})
