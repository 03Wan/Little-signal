type ToastProperties = {
  visible: WechatMiniprogram.Component.FullProperty<BooleanConstructor> & {
    observer: string
  }
  message: WechatMiniprogram.Component.FullProperty<StringConstructor>
  duration: WechatMiniprogram.Component.FullProperty<NumberConstructor>
}

type ToastMethods = {
  onVisibilityChange(visible: boolean): void
  handleDismiss(): void
  clearTimer(): void
}

interface ToastInstanceState {
  timeoutId?: number
}

Component<{}, ToastProperties, ToastMethods, ToastInstanceState>({
  properties: {
    visible: { type: Boolean, value: false, observer: 'onVisibilityChange' },
    message: { type: String, value: '' },
    duration: { type: Number, value: 2000 }
  },
  methods: {
    onVisibilityChange(visible) {
      this.clearTimer()
      if (!visible || this.data.duration <= 0) return
      this.timeoutId = setTimeout(() => {
        this.triggerEvent('close')
      }, this.data.duration)
    },
    handleDismiss() {
      this.clearTimer()
      this.triggerEvent('close')
    },
    clearTimer() {
      if (this.timeoutId === undefined) return
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  },
  lifetimes: {
    attached() {
      this.onVisibilityChange(this.data.visible)
    },
    detached() {
      this.clearTimer()
    }
  }
})
