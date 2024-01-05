import { uploadUrlHost } from '../../utils/constants'
import { get, post, getAllParams } from '../../utils/index'

const app = getApp()

// const defaultBg = 'https://image.jkcspace.com/wxmini_static/images/ground-bg2.png'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultData: {
      title: '新人礼包',
      hideShare: true
    },
    physicalStore: { },
    libaoData: {},
    data: null,
    uploadUrlHost: uploadUrlHost,
    isSet: true,
    bg1: 'https://image.jkcspace.com/wxmini_static/images/ground-bg1.png',
    bg2: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow (options) {
    this.handleGetUserInfo()

    if (app.globalData.store && app.globalData.store.id) {
      this.setData({
        physicalStore: app.globalData.store
      })
    }
    this.getSetting()

    // 绑定上级 
    let scene = decodeURIComponent(getCurrentPages()[0].options.scene)
    scene = getAllParams(scene)
    const params = {}
    if (scene.m) { // 小程序码
      params.id = scene.m
      params.type = scene.t
     } else if (getCurrentPages()[0].options.id && getCurrentPages()[0].options.id != 'undefined') { // 分享页面
      params.id = getCurrentPages()[0].options.id
      params.type = getCurrentPages()[0].options.type
    } 
    if (params.id) {
      app.globalData.shareData = {
        ...params
      }
      post('/member/bind_superior', {
        ...params
      }).then(() => {
        app.globalData.shareData = {}
      })
    }
    wx.setStorageSync('SHAREDATA', app.globalData.shareData)
    // console.log('>>>ground', app.globalData.shareData)
  },
  handleGetUserInfo () {
    get('/member/info')
      .then(({ data }) => {
        this.setData({ userInfo: data })
        app.globalData.userInfo = {
          ...app.globalData.userInfo,
          ...data
        }
      })
      .finally(() => {
        wx.stopPullDownRefresh()
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
  onChange ({ detail }) {
    this.setData({ physicalStore: { ...detail.store } })
    this.getNewcomer(detail.store.id)
  },
  getNewcomer (id) {
    get('/vip_card/newcomer', {
      physical_store_id: id
    }, {
      silent: false
    })
      .then(({ data }) => {
        console.log('>>>getNewcomer', data, Array.isArray(data))
        if (Array.isArray(data)) {
          this.setData({
            isSet: false,
            bg2: '',
            libaoData: {}
          })
          return
        }
        this.setData({
          isSet: !!data.id,
          bg2: data.thum_img_url ? `${uploadUrlHost}/${data.thum_img_url}` : '',
          libaoData: { ...data }
        })
      })
  },
  getStoreDetails (obj) {
    if (app.globalData.store && app.globalData.store.id) {
      this.getNewcomer(app.globalData.store.id)
      return
    }
    get('/store/detail', { ...obj }, {
      showLoading: true
    })
      .then(({ data }) => {
        this.getNewcomer(data.id)
        // this.setData({
        //   vipList: data.vip_card
        // })
        if (!(app.globalData.store && app.globalData.store.id)) {
          this.setData({
            physicalStore: data
          })
        }
      })
  },
  onBuy2 () {
    wx.navigateTo({ url: `/pages/my/buy/index` })
  },
  onBuy () {
    if (!app.globalData.token) {
      wx.navigateTo({ url: `/pages/auth/index` })
      return
    }
    const { libaoData, physicalStore } = this.data
    post('/vip_card/buy', {
      id: libaoData.id,
      physical_store_id: physicalStore.id
    })
      .then(({ data }) => {
        wx.requestPayment({
          nonceStr: data.nonce_str,
          package: data.package,
          paySign: data.pay_sign,
          signType: data.sign_type,
          timeStamp: data.time_stamp,
          success: (res) => {
            if (app.globalData.userInfo.information_card_status != 1) {
              wx.navigateTo({
                url: '/pages/my/ziliao/index'
              })
              return
            }
            wx.switchTab({
              url: '/pages/offcourse/index?isBuy=1',
              success: () => {
                wx.showToast({ title: '您已成功购买体验卡，请尽快约课吧！', icon: 'none' })
              }
            })
          },
          fail: (res) => {
            console.log(res, '>>>fail')
          }
        })
      })
  },
  // onShareAppMessage () {
  //   const { userInfo } = this.data

  //   return {
  //     title: 'CC编程，课程好 按月付，家长孩子两不误',
  //     path: `/pages/ground/index?id=${userInfo.id}&type=1`,
  //     imageUrl: this.data.posterDatas.pic
  //   }
  // },
  // onShareTimeline () {
  //   const { userInfo } = this.data
  //   console.log('>>>onShareTimeline', userInfo)
    
  //   return {
  //     title: `${userInfo.name}邀请你来一起学习啦，快来一起叭～`,
  //     path: `/pages/ground/index`,
  //     query: `share=${userInfo.id}`,
  //     imageUrl: this.data.posterDatas.pic
  //   }
  // }
})
