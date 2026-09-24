import type { SignalOrbState } from '../../types'

type SignalOrbProperties = {
  state: WechatMiniprogram.Component.FullProperty<StringConstructor> & {
    value?: SignalOrbState
  }
  large: WechatMiniprogram.Component.FullProperty<BooleanConstructor>
}

interface SignalOrbData {
  isPressed: boolean
  touchStartedAt: number
  suppressTap: boolean
}

Component<SignalOrbData, SignalOrbProperties, WechatMiniprogram.Component.MethodOption>({
  properties: {
    state: { type: String, value: 'idle' },
    large: { type: Boolean, value: false }
  },
  data: {
    isPressed: false,
    touchStartedAt: 0,
    suppressTap: false
  },
  methods: {
    handleTouchStart(event: WechatMiniprogram.TouchEvent) {
      if (this.data.state === 'disabled' || this.data.state === 'sending') return
      const touch = event.touches[0]
      this.setData({ isPressed: true, touchStartedAt: Date.now(), suppressTap: false })
      this.triggerEvent('pressstart', {
        pageX: touch ? touch.pageX : 0,
        pageY: touch ? touch.pageY : 0
      })
    },
    handleTouchMove(event: WechatMiniprogram.TouchEvent) {
      if (this.data.state === 'disabled' || this.data.state === 'sending') return
      const touch = event.touches[0]
      if (!touch) return
      this.triggerEvent('touchmove', { pageX: touch.pageX, pageY: touch.pageY })
    },
    handleTouchEnd(event: WechatMiniprogram.TouchEvent) {
      if (!this.data.isPressed) return
      const touch = event.changedTouches[0]
      const longPress = Date.now() - this.data.touchStartedAt >= 450
      this.setData({ isPressed: false, suppressTap: longPress })
      this.triggerEvent('pressend', {
        pageX: touch ? touch.pageX : 0,
        pageY: touch ? touch.pageY : 0,
        longPress
      })
    },
    handleTap() {
      if (this.data.state === 'disabled' || this.data.state === 'sending') return
      if (this.data.suppressTap) {
        this.setData({ suppressTap: false })
        return
      }
      this.triggerEvent('orbpress')
    }
  }
})
