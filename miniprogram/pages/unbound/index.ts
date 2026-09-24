import { getCurrentActiveRelationship } from '../../services/relationship-service'

interface UnboundPageMethods {
  createConnection(): void
}

Page<Record<string, never>, UnboundPageMethods>({
  data: {},
  onShow() {
    void getCurrentActiveRelationship().then((relationship) => {
      if (relationship) wx.switchTab({ url: '/pages/home/index' })
    })
  },
  createConnection() {
    wx.navigateTo({ url: '/pages/bind/index' })
  }
})
