export interface GesturePoint {
  pageX: number
  pageY: number
}

export interface SignalGestureHandlers {
  onSingleTap(): void
  onDoubleTap(): void
  onLongPress(): void
  onWheelMove(point: GesturePoint): void
  onWheelEnd(point: GesturePoint): void
}

export interface SignalGestureTimerHost {
  setTimeout(callback: () => void, delay: number): number
  clearTimeout(timerId: number): void
}

export const DOUBLE_TAP_WINDOW_MS = 300
export const LONG_PRESS_THRESHOLD_MS = 450
export const SINGLE_TAP_DELAY_MS = 300

const defaultTimerHost: SignalGestureTimerHost = {
  setTimeout(callback, delay) {
    return setTimeout(callback, delay)
  },
  clearTimeout(timerId) {
    clearTimeout(timerId)
  }
}

export class SignalGestureController {
  private singleTapTimer: number | null = null
  private longPressTimer: number | null = null
  private firstTapAt: number | null = null
  private secondTapCandidate = false
  private longPressTriggered = false
  private wheelActive = false
  private pressed = false
  private movedBeforeLongPress = false
  private startPoint: GesturePoint | null = null
  private readonly handlers: SignalGestureHandlers
  private readonly timerHost: SignalGestureTimerHost
  private readonly now: () => number

  constructor(
    handlers: SignalGestureHandlers,
    timerHost: SignalGestureTimerHost = defaultTimerHost,
    now: () => number = () => Date.now()
  ) {
    this.handlers = handlers
    this.timerHost = timerHost
    this.now = now
  }

  touchStart(point?: GesturePoint): void {
    const startedAt = this.now()
    this.pressed = true
    this.startPoint = point ?? null
    this.movedBeforeLongPress = false
    this.longPressTriggered = false
    this.secondTapCandidate = false

    if (this.singleTapTimer !== null && this.firstTapAt !== null) {
      const elapsed = startedAt - this.firstTapAt
      if (elapsed <= DOUBLE_TAP_WINDOW_MS) {
        this.clearSingleTapTimer()
        this.secondTapCandidate = true
      }
    }

    this.clearLongPressTimer()
    this.longPressTimer = this.timerHost.setTimeout(() => {
      if (!this.pressed) return
      this.clearSingleTapTimer()
      this.firstTapAt = null
      this.secondTapCandidate = false
      this.longPressTriggered = true
      this.wheelActive = true
      this.handlers.onLongPress()
    }, LONG_PRESS_THRESHOLD_MS)
  }

  touchMove(point: GesturePoint): void {
    if (this.wheelActive) {
      this.handlers.onWheelMove(point)
      return
    }

    if (this.startPoint === null || this.longPressTimer === null) return
    const distanceX = point.pageX - this.startPoint.pageX
    const distanceY = point.pageY - this.startPoint.pageY
    if (Math.sqrt(distanceX * distanceX + distanceY * distanceY) > 18) {
      this.movedBeforeLongPress = true
      this.clearLongPressTimer()
    }
  }

  touchEnd(point: GesturePoint): void {
    this.pressed = false
    this.clearLongPressTimer()

    if (this.wheelActive) {
      this.wheelActive = false
      this.handlers.onWheelEnd(point)
    }
    this.startPoint = null
  }

  tap(): void {
    if (this.longPressTriggered) {
      this.longPressTriggered = false
      return
    }
    if (this.movedBeforeLongPress) {
      this.movedBeforeLongPress = false
      return
    }

    const tappedAt = this.now()
    const isDoubleTap = this.secondTapCandidate
      && this.firstTapAt !== null
      && tappedAt - this.firstTapAt <= DOUBLE_TAP_WINDOW_MS

    if (isDoubleTap) {
      this.clearSingleTapTimer()
      this.firstTapAt = null
      this.secondTapCandidate = false
      this.handlers.onDoubleTap()
      return
    }

    this.clearSingleTapTimer()
    this.firstTapAt = tappedAt
    this.secondTapCandidate = false
    this.startPoint = null
    this.movedBeforeLongPress = false
    this.singleTapTimer = this.timerHost.setTimeout(() => {
      this.singleTapTimer = null
      this.firstTapAt = null
      this.handlers.onSingleTap()
    }, SINGLE_TAP_DELAY_MS)
  }

  dispose(): void {
    this.pressed = false
    this.wheelActive = false
    this.secondTapCandidate = false
    this.clearSingleTapTimer()
    this.clearLongPressTimer()
  }

  private clearSingleTapTimer(): void {
    if (this.singleTapTimer === null) return
    this.timerHost.clearTimeout(this.singleTapTimer)
    this.singleTapTimer = null
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer === null) return
    this.timerHost.clearTimeout(this.longPressTimer)
    this.longPressTimer = null
  }
}
