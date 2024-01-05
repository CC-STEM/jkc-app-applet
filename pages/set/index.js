import { get, post, setToken } from '../../utils/index'
const app = getApp ()

Page({
  data: {
    isChecked: false,
    defaultData: {
      title: '设置'
    },
    userInfo: {}
  },
  onShow (options) {
    if (app.globalData.userInfo && app.globalData.userInfo.mobile) {
      this.setData({ userInfo: app.globalData.userInfo })
    } else {
      get('/member/member_data')
        .then(({ data }) => {
          this.setData({ userInfo: data })
          app.globalData.userInfo = {
            ...app.globalData.userInfo,
            ...data
          }
          wx.setStorageSync('userInfo', data)
        })
    }
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
  onSignOut () {
    post('/sign_out/wxmini_mobile')
      .then(({ data }) => {
        wx.reLaunch({ url: '/pages/index/index' })
        app.globalData.token = null
        app.globalData.userInfo = {}
        app.globalData.store = {}
        setToken(null)
        wx.setStorageSync('TOKEN', null)
        wx.setStorageSync('isManager', null)
        wx.setStorageSync('store', {})
      })
      .catch(e => {
        console.error(e)
      })
  }
})
