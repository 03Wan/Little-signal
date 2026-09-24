Component({
  properties: {
    title: { type: String, value: '暂时出现问题' },
    description: { type: String, value: '' },
    actionText: { type: String, value: '再试一次' }
  },
  methods: {
    handleRetry() {
      this.triggerEvent('retry')
    }
  }
})
