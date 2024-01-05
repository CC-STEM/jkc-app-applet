import { get, post } from '../../utils/index'
import { sexMap, uploadUrlHost } from '../../utils/constants'
import dayjs from "dayjs"

const app = getApp()

Page({
  data: {
    receive_status: 0,
    page: 1,
    dataSource: [],
    total: 0,
    defaultData: {
      // title: '我的主页', // 导航栏标题
      noBgColor: true,
      hideShare: true
      // isWhite: true,
      // hideReturn: true
    },
    show: false,
    data: {},
    date: dayjs().format('YYYY-MM'),
    todayData: {},
    // userInfo: {},
    // info: {},
    uploadUrlHost: uploadUrlHost,
    token: null,
    today: dayjs().format('YYYY.MM.DD'),
    physicalStore: {}
  },
  onShow (options) {
    console.log('>>app.globalData.store', app.globalData.store)
    if (app.globalData.store && app.globalData.store.id) {
      this.setData({
        physicalStore: app.globalData.store
      })
    }
    this.getSetting()
  },
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
                wx.openSetting()
                app.globalData.isCancelLocationAuth = false
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
      this.getStoreDetails({
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
        this.getStoreDetails({
          latitude: latitude,
          longitude: longitude
        })
      },
      fail: (err) => {
        this.getStoreDetails({
          latitude: 0,
          longitude: 0
        })
        // wx.showToast({ icon: 'error', title: '太频繁啦～' })
      }
    })
  },
  getStoreDetails (obj) {
    if (app.globalData.store && app.globalData.store.id) {
      this.onPullDownRefresh()
      return
    }
    get('/store/detail', { ...obj }, {
      showLoading: true
    })
      .then(({ data }) => {
        this.setData({
          physicalStore: data
        })
        console.log('>>getStoreDetails', data)
        app.globalData.store = {
          ...app.globalData.store, 
          ...data
        }
        this.onPullDownRefresh()
      })
  },
  onPullDownRefresh () {
    this.handleGetTotalData()
    this.handleGetTodayData()
  },
  handleGetTotalData () {
    const { date } = this.data
    get('/store_manager/store_revenue_statistics', {
      month: date
    })
      .then(({ data }) => {
        this.setData({ data: data })
      }).finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  handleGetTodayData () {
    get('/store_manager/store_today_statistics')
      .then(({ data }) => {
        this.setData({ todayData: data })
      }).finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onShowModal () {
    if (!app.globalData.token) {
      wx.navigateTo({ url: `/pages/auth/index` })
      return
    }
    this.setData({ show: true })
  },
  onCancel () {
    this.setData({ show: false })
  },
  onOkDate ({ detail }) {
    this.setData({ date: detail.date })
    this.handleGetTotalData()
  },
  onOkStore ({ detail }) {
    console.log('>onOkStore', detail)
    post('/store_manager/selected_physical_store', {
      id: detail.physicalStore.id
    })
      .then(res => {
        app.globalData.store = {
          ...app.globalData.store,
          ...detail.physicalStore
        }
        this.setData({
          physicalStore: {
            ...detail.physicalStore
          }
        })
        wx.setStorageSync('store', app.globalData.store)
        this.onPullDownRefresh()
        this.onCancel()
      })
  }
})
