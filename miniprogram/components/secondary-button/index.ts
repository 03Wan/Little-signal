Component({
  properties: {
    disabled: { type: Boolean, value: false },
    loading: { type: Boolean, value: false },
    block: { type: Boolean, value: true }
  },
  methods: {
    handlePress() {
      if (this.data.disabled || this.data.loading) return
      this.triggerEvent('press', {}, { bubbles: true, composed: true })
    }
  }
})
