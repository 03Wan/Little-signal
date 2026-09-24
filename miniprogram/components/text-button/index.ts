Component({
  properties: {
    disabled: { type: Boolean, value: false },
    danger: { type: Boolean, value: false }
  },
  methods: {
    handlePress() {
      if (this.data.disabled) return
      this.triggerEvent('press', {}, { bubbles: true, composed: true })
    }
  }
})
