import { sendSignal } from '../../services/signal-service'
import { createInputForCurrentUser, deferSignal, getCurrentMockPartner, getCurrentMockUser, getInbox, getSentSignals, getSignalResponse, isDevelopmentEnvironment, retrySignal, switchCurrentMockUser } from '../../services/signal-service'
import { DEFAULT_MOOD, getCurrentUserMood, getMoodPresentation, getPartnerTodayMood } from '../../services/mood-service'
import { listEnabledCustomSignals } from '../../services/custom-signal-service'
import type { CreateSignalInput, CustomSignal, MoodPresentation, MockUser, Signal, SignalOrbState, SignalType } from '../../types'
import { getQuickSignalSelection, SIGNAL_OPTIONS, type SignalOption } from '../../utils/signals'
import { SignalGestureController, type GesturePoint } from '../../utils/signal-gesture'
import { getNavigationTopPadding } from '../../utils/navigation'
import { consumeSignalPickerOnHome } from '../../stores/navigation-intent'

interface HomePageData {
  pageTopPadding: number
  partner: MockUser
  partnerMood: MoodPresentation
  myMood: MoodPresentation
  momentCount: number
  orbState: SignalOrbState
  pickerOpen: boolean
  quickWheelOpen: boolean
  wheelSessionActive: boolean
  activeWheelType: SignalType | ''
  wheelCenterX: number
  wheelCenterY: number
  noReply: boolean
  isSending: boolean
  toastVisible: boolean
  toastMessage: string
  signals: typeof SIGNAL_OPTIONS
  pickerSignals: SignalOption[]
  lastSentSignal: Signal | null
  failedInput: CreateSignalInput | null
  isDevelopment: boolean
  currentUser: MockUser
  inboxSignalId: string
  senderFeedback: string
}

interface EventDetail<T> {
  detail: T
}

interface HomePageMethods {
  handleOrbPressStart(event: EventDetail<GesturePoint>): void
  handleOrbPressEnd(event: EventDetail<GesturePoint>): void
  handleOrbTouchMove(event: EventDetail<GesturePoint>): void
  handleOrbTap(): void
  handlePickerClose(): void
  handlePickerSelect(event: EventDetail<{ type: SignalType; customSignalId?: string }>): void
  handlePickerMoment(): void
  handleNoReplyChange(event: EventDetail<{ value: boolean }>): void
  handleToastClose(): void
  handleSingleTap(): void
  handleDoubleTap(): void
  handleLongPress(): void
  setTabBarHidden(hidden: boolean): void
  handleWheelMove(point: GesturePoint): void
  handleWheelEnd(point: GesturePoint): void
  sendSignal(type: SignalType, customSignalId?: string): Promise<void>
  finishSending(): void
  switchMockUser(): void
  openInbox(): void
  retryFailedSignal(): Promise<void>
  deferFailedSignal(): Promise<void>
  refreshMockSignals(): Promise<void>
  refreshPartnerMood(): Promise<void>
  refreshCustomSignals(): Promise<void>
  openMoodSettings(): void
  openSettings(): void
}

const gestureControllers = new WeakMap<object, SignalGestureController>()
const sendTimers = new WeakMap<object, number>()
Page<HomePageData, HomePageMethods>({
  data: {
    pageTopPadding: getNavigationTopPadding(),
    partner: getCurrentMockPartner(),
    partnerMood: DEFAULT_MOOD,
    myMood: DEFAULT_MOOD,
    momentCount: 3,
    orbState: 'idle',
    pickerOpen: false,
    quickWheelOpen: false,
    wheelSessionActive: false,
    activeWheelType: '',
    wheelCenterX: 0,
    wheelCenterY: 0,
    noReply: false,
    isSending: false,
    toastVisible: false,
    toastMessage: '',
    signals: SIGNAL_OPTIONS,
    pickerSignals: SIGNAL_OPTIONS,
    lastSentSignal: null,
    failedInput: null,
    isDevelopment: false,
    currentUser: getCurrentMockUser(),
    inboxSignalId: '',
    senderFeedback: ''
  },
  onLoad() {
    const page = this
    const controller = new SignalGestureController({
      onSingleTap: () => page.handleSingleTap(),
      onDoubleTap: () => page.handleDoubleTap(),
      onLongPress: () => page.handleLongPress(),
      onWheelMove: (point) => page.handleWheelMove(point),
      onWheelEnd: (point) => page.handleWheelEnd(point)
    })
    gestureControllers.set(this, controller)
  },
  onUnload() {
    const controller = gestureControllers.get(this)
    controller?.dispose()
    gestureControllers.delete(this)
    const timer = sendTimers.get(this)
    if (timer !== undefined) clearTimeout(timer)
    sendTimers.delete(this)
  },
  onShow() {
    this.setTabBarHidden(false)
    this.getTabBar().setData({ selectedKey: 'signal' })
    this.setData({ isDevelopment: isDevelopmentEnvironment(), currentUser: getCurrentMockUser() })
    void this.refreshMockSignals()
    void this.refreshPartnerMood()
    void this.refreshCustomSignals()
    if (consumeSignalPickerOnHome()) this.handleSingleTap()
  },
  handleOrbPressStart(event) {
    gestureControllers.get(this)?.touchStart(event.detail)
  },
  handleOrbPressEnd(event) {
    gestureControllers.get(this)?.touchEnd(event.detail)
  },
  handleOrbTouchMove(event) {
    gestureControllers.get(this)?.touchMove(event.detail)
  },
  handleOrbTap() {
    gestureControllers.get(this)?.tap()
  },
  handleSingleTap() {
    this.setTabBarHidden(true)
    this.setData({ pickerOpen: true })
  },
  handleDoubleTap() {
    void this.sendSignal('knock')
  },
  handleLongPress() {
    this.setTabBarHidden(true)
    this.setData({ wheelSessionActive: true })
    this.createSelectorQuery().select('#signal-orb-anchor').boundingClientRect((rect) => {
      if (!rect || !this.data.wheelSessionActive) {
        this.setTabBarHidden(false)
        return
      }
      this.setData({
        quickWheelOpen: true,
        activeWheelType: '',
        wheelCenterX: rect.left + rect.width / 2,
        wheelCenterY: rect.top + rect.height / 2
      })
    }).exec()
  },
  handleWheelMove(point) {
    if (!this.data.quickWheelOpen) return
    const activeWheelType = getQuickSignalSelection(
      point.pageX - this.data.wheelCenterX,
      point.pageY - this.data.wheelCenterY
    ) ?? ''
    if (activeWheelType !== this.data.activeWheelType) this.setData({ activeWheelType })
  },
  handleWheelEnd(point) {
    const selectedType = getQuickSignalSelection(
      point.pageX - this.data.wheelCenterX,
      point.pageY - this.data.wheelCenterY
    )
    this.setData({ quickWheelOpen: false, wheelSessionActive: false, activeWheelType: '', orbState: 'idle' })
    this.setTabBarHidden(false)
    if (selectedType) void this.sendSignal(selectedType)
  },
  handlePickerClose() {
    this.setTabBarHidden(false)
    this.setData({ pickerOpen: false })
  },
  handlePickerSelect(event) {
    this.setTabBarHidden(false)
    void this.sendSignal(event.detail.type, event.detail.customSignalId)
  },
  handlePickerMoment() {
    this.setTabBarHidden(false)
    this.setData({ pickerOpen: false })
    wx.navigateTo({ url: '/pages/moment/index' })
  },
  handleNoReplyChange(event) {
    this.setData({ noReply: event.detail.value })
  },
  switchMockUser() {
    if (!isDevelopmentEnvironment()) return
    const currentUser = switchCurrentMockUser()
    this.setData({ currentUser, partner: getCurrentMockPartner(), senderFeedback: '', inboxSignalId: '' })
    void this.refreshMockSignals()
    void this.refreshPartnerMood()
  },
  openInbox() {
    wx.navigateTo({ url: '/pages/signal/detail' })
  },
  openMoodSettings() {
    wx.navigateTo({ url: '/pages/mood/index' })
  },
  openSettings() {
    wx.navigateTo({ url: '/pages/settings/index' })
  },
  setTabBarHidden(hidden) {
    this.getTabBar().setData({ hidden })
  },
  async refreshPartnerMood() {
    const user = getCurrentMockUser()
    const [partnerMood, currentMood] = await Promise.all([
      getPartnerTodayMood(user.id),
      getCurrentUserMood()
    ])
    this.setData({
      partner: getCurrentMockPartner(),
      partnerMood,
      myMood: currentMood ? getMoodPresentation(currentMood.type, currentMood.customLabel) : DEFAULT_MOOD
    })
  },
  async refreshMockSignals() {
    const user = getCurrentMockUser()
    if (user.role === 'B') {
      const inbox = await getInbox(user.id)
      this.setData({ inboxSignalId: inbox[0]?.id ?? '', senderFeedback: '' })
      return
    }
    const sent = await getSentSignals(user.id)
    const latestSent = sent[0] ?? null
    const latestResponded = latestSent?.status === 'responded' ? latestSent : null
    const response = latestResponded ? await getSignalResponse(latestResponded.id) : null
    const latestFailed = sent.find((signal) => signal.status === 'failed')
    this.setData({
      lastSentSignal: latestSent,
      failedInput: latestFailed ? createInputForCurrentUser(latestFailed.type, latestFailed.noReply, latestFailed.customSignalId) : null,
      senderFeedback: response ? 'TA 接住了你的信号' : ''
    })
  },
  handleToastClose() {
    this.setData({ toastVisible: false })
  },
  async refreshCustomSignals() {
    let customSignals: CustomSignal[] = []
    try {
      customSignals = await listEnabledCustomSignals()
    } catch {
      customSignals = []
    }
    const customOptions = customSignals.map((signal) => ({
      key: `custom-${signal.id}`,
      type: 'custom' as const,
      label: signal.name,
      pickerLabel: signal.name,
      icon: signal.emoji,
      customSignalId: signal.id,
      x: 0,
      y: 0
    }))
    this.setData({ pickerSignals: [...SIGNAL_OPTIONS, ...customOptions] })
  },
  async sendSignal(type, customSignalId) {
    if (this.data.isSending) return
    this.setTabBarHidden(false)
    this.setData({
      pickerOpen: false,
      quickWheelOpen: false,
      activeWheelType: '',
      isSending: true,
      orbState: 'sending',
      toastVisible: false
    })

    const input = { ...createInputForCurrentUser(type, this.data.noReply), customSignalId }
    this.setData({ failedInput: input })

    try {
      const signal = await sendSignal(input)
      this.setData({
        lastSentSignal: signal,
        failedInput: null,
        toastMessage: '信号已经送出',
        toastVisible: true,
        senderFeedback: '',
        currentUser: getCurrentMockUser()
      })
      wx.vibrateShort({ type: 'light' })
    } catch {
      const failedSignal = (await getSentSignals(getCurrentMockUser().id)).find((item) => item.status === 'failed') ?? null
      this.setData({ lastSentSignal: failedSignal, failedInput: input, toastMessage: '信号还没有送出去', toastVisible: true })
    }

    const timer = setTimeout(() => {
      sendTimers.delete(this)
      this.finishSending()
    }, 800)
    sendTimers.set(this, timer)
  },
  finishSending() {
    const timer = sendTimers.get(this)
    if (timer !== undefined) clearTimeout(timer)
    sendTimers.delete(this)
    this.setData({ isSending: false, orbState: 'idle' })
  },
  async retryFailedSignal() {
    if (this.data.isSending || !this.data.lastSentSignal || this.data.lastSentSignal.status !== 'failed') return
    this.setData({ isSending: true, orbState: 'sending' })
    try {
      const signal = await retrySignal(this.data.lastSentSignal.id)
      this.setData({ lastSentSignal: signal, failedInput: null, toastMessage: '信号已经送出', toastVisible: true })
      wx.vibrateShort({ type: 'light' })
    } catch {
      this.setData({ toastMessage: '信号还没有送出去', toastVisible: true })
    }
    this.finishSending()
  },
  async deferFailedSignal() {
    const input = this.data.failedInput
    if (!input) return
    await deferSignal(input)
    this.setData({ failedInput: null, lastSentSignal: null, toastMessage: '已暂存，稍后发送', toastVisible: true })
  }
})
