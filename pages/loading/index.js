const app = getApp()

let timer = null

Page({
  data: {},
  // onLoad (options) {
  //   this.handleCheckLaunchStatus()
  // },
  onShow (options) {
    this.handleCheckLaunchStatus()
  },
  onHide () {
    clearTimeout(timer)
  },
  onUnload() {
    clearTimeout(timer)
  },
  handleCheckLaunchStatus () {
    clearTimeout(timer)
    if (app.globalData.launching == 2) {
      setTimeout(this.handleCheckLaunchStatus, 500)
      return
    }
    if (app.globalData.launching == 0) {
      wx.navigateTo({ url: '/pages/auth/index' })
    } else {
      wx.switchTab({ url: '/pages/index/index' })
    }
  }
})
