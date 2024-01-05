const app = getApp()

Component ({
  properties: {
    // defaultData（父页面传递的数据-就是引用组件的页面）
    defaultData: {
      type: Object,
      value: {
        title: '甲壳虫',
        noBgColor: false,
        isWhite: false,
        hideShare: false,
        shareId: '',
        type: 1
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
    show: false,
    shareId: '',
    type: 1
  },
  attached () {
    if (this.data.defaultData.shareId) {
      this.setData({ 
        shareId: this.data.defaultData.shareId,
      })
    }
  },
  methods: {
    btn () {
      this.setData({ show: true })
    },
    bindClose () {
    },
    bindButtonTap (e) {
      this.setData({ show: false })
    },
    onReturn () {
      const { defaultData, isManager } = this.data
      const url = isManager 
        ? '/pages/manager/index' 
        : `/pages/index/index?id=${defaultData.shareId}&type=${defaultData.type}`
      
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
