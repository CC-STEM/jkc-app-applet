const app = getApp()

Component ({
  properties: {
    // defaultData（父页面传递的数据-就是引用组件的页面）
    defaultData: {
      type: Object,
      value: {
        title: '设置',
        noBgColor: false,
        isWhite: false,
        hideShare: false,
      },
      observer: function (newVal, oldVal) {}
    },
    isManager: {
      type: Boolean,
      value: false
    },
  },
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    navBarHeight: app.globalData.navBarHeight,
    menuRight: app.globalData.menuRight,
    menuTop: app.globalData.menuTop,
    menuHeight: app.globalData.menuHeight,
    navBarAndStatusBarHeight: app.globalData.statusBarHeight + app.globalData.navBarHeight,
    show: false
  },
  attached () {},
  methods: {
    onSet () {
      if (!app.globalData.token) {
        wx.navigateTo({ url: `/pages/auth/index` })
        return
      }
      wx.navigateTo({ url: `/pages/set/index` })

    },
    btn () {
      this.setData({ show: true })
    },
    bindClose () {
    },
    bindButtonTap (e) {
      this.setData({ show: false })
    },
    onReturn () {
      const url = this.data.isManager ? '/pages/manager/index' : '/pages/index/index'
      wx.navigateBack({
        delta: 1,
        fail (res) {
          wx.reLaunch({
            url: url
          })
        }
      })
    }
  }
})
