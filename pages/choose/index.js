Page({
  data: {
    defaultData: {
      title: '',
      hideShare: true,
      noBgColor: true
    }
  },
  onLoad (options) {
  },
  onChoose ({ currentTarget }) {
    const type = currentTarget.dataset.type
    if (type == 1) {
      wx.setStorageSync('isManager', 1)
      wx.reLaunch({ url: '/pages/manager/index' })
    } else {
      wx.setStorageSync('isManager', null)
      wx.reLaunch({ url: '/pages/teacher/index' })
    }
  }
})
