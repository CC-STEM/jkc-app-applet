import { get } from '../../utils/index'
import { uploadUrlHost } from '../../utils/constants'

const app = getApp()

Component ({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    defaultData: {
      type: Object,
      value: {}
    },
    list: {
      type: Array,
      value: []
    },
    type: {
      type: String,
      value: ''
    },
  },
  data: {
    list: [],
    uploadUrlHost: uploadUrlHost,
    showQrcode: false,
    wxQrcode: ''
  },
  lifetimes: {
    attached () {
      if (app.globalData.storeList.length) {
        this.setData({ list: app.globalData.storeList })
        return
      }

      if (app.globalData.latitude) {
        this.getStoreList({
          latitude: app.globalData.latitude,
          longitude: app.globalData.longitude
        })
      } else {
        this.getSetting()
      }
    }
  },
  methods: {
    getStoreList (obj) {
      const { type } = this.data
      const url = type == 'manage' ? '/store_manager/manage_physical_store' : '/store/list'
      get(url, { ...obj }).then(res => {
        app.globalData.storeList = res.data.list
        this.setData({ list: res.data.list })
      })
    },
    // 校验是否授权定位
    getSetting () {
      wx.getSetting({
        success: (res) => {
          const authSetting = res.authSetting
          if (authSetting['scope.userLocation'] || authSetting['scope.userLocation'] == undefined) {
            // 已授权 || 尚未进行操作
            this.getLocation()
            app.globalData.isCancelLocationAuth = false
          } else {
          // 曾拒绝授权，需主动前往进行授权
            wx.showModal({
              title: '您未开启地理位置授权',
              content: '是否前往授权？',
              success: res => {
                if (res.cancel) {
                  app.globalData.isCancelLocationAuth = true
                  this.getLocation()
                }
                if (res.confirm) {
                  app.globalData.isCancelLocationAuth = false
                  wx.openSetting()
                }
              }
            })
          }
        }
      })
    },
    // 获取位置信息
    getLocation () {
      if (app.globalData.longitude || app.globalData.isCancelLocationAuth) {
        // 通过接口置换定位信息进行展示
        this.getStoreList({
          latitude: app.globalData.latitude,
          longitude: app.globalData.longitude
        })
        return
      }
      wx.getLocation({
        isHighAccuracy: true,
        altitude: 'altitude',
        type: 'type',
        success: (res) => {
          const { latitude, longitude } = res
          app.globalData.longitude = longitude
          app.globalData.latitude = latitude
          // 通过接口置换定位信息进行展示
          this.getStoreList({
            latitude: latitude,
            longitude: longitude
          })
        },
        fail: (err) => {
          this.getStoreList({
            latitude: 0,
            longitude: 0
          })
        }
      })
    },
    onSubmit ({ currentTarget }) {
      const item = currentTarget.dataset.item
      this.triggerEvent('ok', {
        store: item
      })
      app.globalData.store = item
      this.hideModal()
    },
    onShowQrcode({ currentTarget }) {
      const wxQrcode = currentTarget.dataset.wxcode
      console.log('>>wxQrcode', wxQrcode, currentTarget)
      this.setData({ showQrcode: true, wxQrcode })
    },
    onCancel() {
      this.setData({ showQrcode: false })
    },
    onCall ({ currentTarget }) {
      const phone = currentTarget.dataset.phone
      wx.makePhoneCall({
        phoneNumber: phone
      })
    },
    onCopy () {
      wx.setClipboardData({ data: this.data.dataSource.package.express_number })
    },
    // 取消
    mCancel () {
      this.hideModal()
    },
    // 隐藏遮罩层
    hideModal () {
      this.triggerEvent('cancel', false)
      const that = this
      const animation = wx.createAnimation({
        duration: 400, // 动画的持续时间 默认400ms
        timingFunction: 'ease' // 动画的效果 默认值是linear
      })
      this.animation = animation
      that.slideDown() // 调用动画--滑出
      let time1 = setTimeout(function () {
        that.setData({
          show: false
        })
        clearTimeout(time1)
        time1 = null
      }, 220) // 先执行下滑动画，再隐藏模块
    },
    // 动画 -- 滑入
    slideIn () {
      this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
      this.setData({
        //  动画实例的export方法导出动画数据传递给组件的animation属性
        animationData: this.animation.export()
      })
    },
    // 动画 -- 滑出
    slideDown () {
      this.animation.translateY(2000).step()
      this.setData({
        animationData: this.animation.export()
      })
    }
  }
})
