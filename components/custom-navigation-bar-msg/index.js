const app = getApp()

Component ({
  properties: {
    // defaultData（父页面传递的数据-就是引用组件的页面）
    defaultData: {
      type: Object,
      value: {
        tabs: [],
        num1: 1,
        num2: 0,
        showNum: false,
        hideReturn: false,
        hideShare: false,
        showTab: false,
        noBgColor: false,
        isWhite: false,
        activeTab: {
          type: Number,
          value: 0
        }
      }
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
  attached () {
    console.log('>>defaultData', this.data.defaultData)
    this.setData({ defaultData: { ...this.data.defaultData }})
  },
  methods: {
    handleClick ({ currentTarget }) {
      const index = currentTarget.dataset.index
      if (this.data.activeTab === index) return
      this.triggerEvent('change', {
        index,
        tab: this.data.defaultData.tabs[index]
      })
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
