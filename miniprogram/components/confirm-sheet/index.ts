Component({
  properties: {
    open: { type: Boolean, value: false },
    title: { type: String, value: '确认操作' },
    description: { type: String, value: '' },
    confirmText: { type: String, value: '确认' },
    cancelText: { type: String, value: '取消' },
    destructive: { type: Boolean, value: false }
  },
  methods: {
    handleConfirm() {
      this.triggerEvent('confirm')
    },
    handleCancel() {
      this.triggerEvent('cancel')
      this.triggerEvent('close')
    },
    handleClose() {
      this.triggerEvent('close')
    }
  }
})
