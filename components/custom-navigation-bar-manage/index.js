import dayjs from "dayjs";

const app = getApp()

Component ({
  properties: {
    // defaultData（父页面传递的数据-就是引用组件的页面）
    defaultData: {
      type: Object,
      value: {
        title: '甲壳虫',
        noBgColor: false,
        isWhite: false
      },
      observer: function (newVal, oldVal) {}
    },
    isManager: {
      type: Boolean,
      value: false
    },
    physicalStore: {
      type: Object,
      value: { }
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
    date: dayjs().format('YYYY-MM'),
    fdate: dayjs().format('YYYY.MM'),
    storeList: [],
    physicalStore: {}
  },
  attached () {
    console.log('>>physicalStore', this.data.physicalStore)
    this.setData({
      physicalStore: this.data.physicalStore
    })
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
    onCancel () {
      this.setData({ show: false })
    },
    onShowModal () {
      this.setData({ show: true })
    },
    bindPickerChange ({ detail }) {
      this.setData({ date: detail.value, fdate: dayjs(detail.value).format('YYYY.MM') })
      this.triggerEvent('ok2', { date: detail.value })
    },
    onOk ({ detail }) {
      this.setData({ 
        physicalStore: detail.store,
        id: detail.store.physical_store_id
      })
      app.globalData.store = { ...detail.store }
      this.triggerEvent('ok', { physicalStore: { ...detail.store, id: detail.store.physical_store_id } })
    },
    onReturn () {
      wx.navigateBack({
        delta: 1,
        fail (res) {
          wx.reLaunch({
            url: '/pages/manager/index'
          })
        }
      })
    }
  }
})
