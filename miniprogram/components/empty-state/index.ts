Component({
  properties: {
    symbol: { type: String, value: '◌' },
    title: { type: String, value: '' },
    description: { type: String, value: '' },
    actionText: { type: String, value: '' }
  },
  methods: {
    handleAction() {
      this.triggerEvent('action')
    }
  }
})
