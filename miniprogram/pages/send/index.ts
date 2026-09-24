import { requestSignalPickerOnHome } from '../../stores/navigation-intent'

Page({
  onShow() {
    requestSignalPickerOnHome()
    setTimeout(() => wx.switchTab({ url: '/pages/home/index' }), 200)
  }
})
