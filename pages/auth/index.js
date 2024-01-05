import { post, setToken } from '../../utils/index'

const app = getApp ()

Page({
  data: {
    isChecked: false,
    defaultData: {
      title: '账号登录'
    },
    code: '',
    isOrder: false
  },
  onLoad (options) {
    this.setData({ isOrder: options.isOrder == 1 })
  },
  onShow () {
    this.getSetting()
  },
  getLogin({
    latitude = 0,
    longitude = 0
  }) {
    wx.login()
    .then(({ code }) => {
      this.setData({ code })
      const params = { code, latitude, longitude }
      return post('/login/wxmini_session', params)
    })
    .catch((res) => {
      console.log(res)
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
      this.getLogin({
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
        this.getLogin({
          latitude: latitude,
          longitude: longitude
        })
      },
      fail: (err) => {
        this.getLogin({
          latitude: 0,
          longitude: 0
        })
        // wx.showToast({ icon: 'error', title: '太频繁啦～' })
      }
    })
  },
  onSelect() {
    this.setData({
      isChecked: !this.data.isChecked
    })
  },
  onBack () {
    wx.navigateBack({
      delta: 1,
      fail (res) {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    })
  },
  getPhoneNumber (e) {
    if (!this.data.isChecked) {
      wx.showToast({ icon: 'none', title: '请阅读甲壳虫平台服务协议，并勾选' })
      return
    }
    post('/login/wxmini_mobile', {
      latitude: app.globalData.latitude,
      longitude: app.globalData.longitude,
      encrypted_data: encodeURIComponent(e.detail.encryptedData),
      iv: e.detail.iv,
      code: this.data.code
    })
      .then(({ data }) => {
        app.globalData.store = {}
        app.globalData.token = data.token
        app.globalData.userInfo = {
          ...app.globalData.userInfo,
          id: data.id,
          identity: data.identity
        }
      
        setToken(data.token)
        wx.setStorageSync('TOKEN', data.token)
        wx.setStorageSync('userInfo', app.globalData.userInfo)
        console.log('>>>auth-<<<>>>token', app.globalData.token)


        // 1 普通用户，2 店长，3 老师+店长
        if (data.identity == 2) {
          wx.setStorageSync('isManager', 1)
          wx.reLaunch({ url: '/pages/manager/index' })
        } else if (data.identity == 3) {
          wx.navigateTo({ url: '/pages/choose/index' })
        } else if (data.identity == 1) {
          // 判断是不是点击进入 商城订单
          if (this.data.isOrder) {
            wx.reLaunch({ url: '/pages/order/index' })
          } else {
            this.onBack()
          }
          wx.setStorageSync('isManager', null)
        } 
        // 绑定分享者id 落地页 分享后进入小程序，未登录的shareid存储，登录时绑定
        const shareData = wx.getStorageSync('SHAREDATA') || {}
        if (shareData.id) {
          post('/member/bind_superior', {
            ...shareData
          }).then(res => { // 登陆绑定后删除
            wx.setStorageSync('SHAREDATA', null)
          })
        }
        console.log('>>>auth-<<<>>>token', app.globalData.token)
      })
      .catch(e => {
        console.error(e)
      })
  },
  goPage () {
    wx.navigateTo({ url: '/pages/agreement/index' })
  }
})
