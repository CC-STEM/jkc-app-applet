import { get, post, getAllParams, token } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'
import WxParse from '../../wxParse/wxParse.js'
const app = getApp ()

Page({
  data: {
    userInfo: {},
    receive_status: 0,
    page: 1,
    dataSource: {},
    article: '',
    addressData: {},
    total: 0,
    defaultData: {
      title: '', // 导航栏标题
      shareId: '', // 分享者id
      type: 3 , // 分享类型
    },
    uploadUrlHost: uploadUrlHost,
    show: false,
    id: '',
    showQrcodeBtn: false,
    token: null
  },
  onLoad (options) {
    const { id, showQrcodeBtn = false } = options
    this.setData({ id })
    showQrcodeBtn == true && this.setData({ showQrcodeBtn: true })
  },
  onShow () {
    let scene = decodeURIComponent(getCurrentPages()[0].options.scene)
    scene = getAllParams(scene)
    // 绑定上级
    if (scene.m) { //  分享者id
      app.globalData.shareData = {
        id: scene.m,
        type: scene.t
      }
      post('/member/bind_superior', {
        id: scene.m,
        type: scene.t
      })
      this.setData({ 
        defaultData: {
          ...this.data.defaultData,
          shareId: scene.m,
          type: scene.t || 3
        }
      })
    }
    // 商品ID
    if (scene.p) {
      this.setData({ id: scene.p })
    }
    console.log('****!!!!****', JSON.stringify(scene))
    this.getDetails()
    this.getAddrDetails()
    if (app.globalData.token) {
      this.setData({ token: app.globalData.token })
    }
  },
  goPage() {
    if (!app.globalData.token) {
      wx.navigateTo({ url: `/pages/auth/index` })
    }
  },
  getAddrDetails () {
    if (app.globalData.addressData.province_id) {
      this.setData({
        addressData: app.globalData.addressData
      })
      return
    }
    get('/address/detail')
      .then(({ data }) => {
        if (!data.province_id) return
        app.globalData.addressData = data
        this.setData({
          addressData: data
        })
      })
  },
  onPullDownRefresh () {
    this.getDetails()
  },
  onReturn () {
    wx.navigateBack({
      delta: 1
    })
  },
  getDetails (id) {
    get('/ta_goods/detail', {
      id: this.data.id
    }, {
      showLoading: true
    })
      .then(({ data }) => {
        const article = data.describe

        this.setData({
          dataSource: data,
          article
        })
        WxParse.wxParse('article', 'html', article, this, 5)
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onShowModal () {
    console.log('>>token', app.globalData.token, token)
    if (!app.globalData.token) {
      wx.navigateTo({ url: `/pages/auth/index` })
      return
    }
    this.setData({ show: true })
  },
  onCancel () {
    this.setData({ show: false })
  },
  onOk ({ detail }) {
    post('/ta_order/add', {
      quantity: detail.quantity,
      sku_id: detail.sku_id,
      coupon_id: detail.coupon_id
    })
      .then(({ data }) => {
        if (data.body == 'zero') {
          wx.redirectTo({ url: '/pages/order/index' })
          this.onCancel()
          return
        }
        wx.requestPayment({
          nonceStr: data.nonce_str,
          package: data.package,
          paySign: data.pay_sign,
          signType: data.sign_type,
          timeStamp: data.time_stamp,
          success (res) {
            wx.redirectTo({ url: '/pages/order/index' })
            this.onCancel()
          },
          fail (res) {
            wx.redirectTo({ url: '/pages/order/index' })
          }
        })
      })
  },
  goPoster () {
    wx.redirectTo({ url: `/pages/invite2/index?id=${this.data.id}` })
  }
})
