Component({
  data: {
    touchStartY: 0,
    touchEndY: 0
  },
  properties: {
    open: { type: Boolean, value: false },
    title: { type: String, value: '' },
    closeOnMask: { type: Boolean, value: true }
  },
  methods: {
    handleMaskTap() {
      if (this.data.closeOnMask) this.triggerEvent('close')
    },
    handleTouchStart(event: WechatMiniprogram.TouchEvent) {
      const touch = event.touches[0]
      this.setData({ touchStartY: touch ? touch.clientY : 0, touchEndY: touch ? touch.clientY : 0 })
    },
    handleTouchMove(event: WechatMiniprogram.TouchEvent) {
      const touch = event.touches[0]
      if (!touch || !this.data.touchStartY) return
      this.setData({ touchEndY: touch.clientY })
    },
    handleTouchEnd() {
      const dragDistance = this.data.touchEndY - this.data.touchStartY
      if (dragDistance >= 80) this.triggerEvent('close')
      this.setData({ touchStartY: 0, touchEndY: 0 })
    },
    stopPropagation() {}
  }
})
