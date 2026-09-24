Page({
  data: { privacyAccepted: false },
  handleStart() {
    if (!this.data.privacyAccepted) {
      wx.showToast({ title: '请先阅读并同意隐私说明', icon: 'none' })
      return
    }
    wx.redirectTo({ url: '/pages/unbound/index' })
  },
  togglePrivacyConsent() {
    this.setData({ privacyAccepted: !this.data.privacyAccepted })
  },
  openPrivacy() {
    wx.navigateTo({ url: '/pages/privacy/index' })
  }
})
