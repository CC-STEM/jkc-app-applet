import { get, post } from '../../utils/index'
import { sexMap, uploadUrlHost } from '../../utils/constants'

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
      // isWhite: true,
      // hideReturn: true
    },
    show: false,
    userInfo: {},
    info: {},
    uploadUrlHost: uploadUrlHost,
    token: null
  },
  onShow () {
    const { reloadCfg = {} } = app.globalData
    // 自定义tabbar需添加初始化代码
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2,
        showListIndex: app.globalData.tabBarList
      })
    }
    if (reloadCfg.enable) {
      this.setData({ status: reloadCfg.options.status })
      wx.startPullDownRefresh()
      app.globalData.reloadCfg = { enable: false, options: null }
    }
    this.getMemberCenter()
    this.handleGetUserInfo()
    if (app.globalData.userInfo && app.globalData.userInfo.id) {
      this.setData({ userInfo: app.globalData.userInfo })
    }

    if (app.globalData.token) {
      this.setData({ token: app.globalData.token })
    }

    // 没有token跳转登陆
    // if (!app.globalData.token) {
    //   wx.navigateTo({ url: `/pages/auth/index` })
    //   return
    // }
  },
  onChange () {
    wx.reLaunch({ url: '/pages/teacher/index' })
  },
  getUserProfile ({ currentTarget }) {
    // 推荐使用 wx.getUserProfile 获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userInfo'] || !app.globalData.userInfo.avatar) {
          // 需要授权
          const type = currentTarget.dataset.type
          wx.getUserProfile({
            desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
              if (type === 'img') {
                this.onSetAvatar(res.userInfo.avatarUrl)
              }
              if (app.globalData.userInfo.name) return
              this.setData({
                userInfo: {
                  ...this.data.userInfo,
                  name: res.userInfo.nickName,
                  hasUserInfo: true
                }
              })
            }
          })
        } else {
          this.setData({ userInfo: app.globalData.userInfo })
        }
      }
    })
  },
  onSetAvatar (url) {
    post('/member/set_avatar', {
      avatar: url
    })
      .then(({ data }) => {
        const _data = {
          ...app.globalData.userInfo,
          avatar: url
        }
        this.setData({ userInfo: _data })
        app.globalData.userInfo = {
          ..._data
        }
      })
  },
  onPullDownRefresh () {
    this.handleGetUserInfo()
  },
  getMemberCenter () {
    get('/member/center')
      .then(({ data }) => {
        this.setData({ info: data })
      })
  },
  handleGetUserInfo () {
    get('/member/member_data')
      .then(({ data }) => {
        this.setData({ userInfo: data })
        app.globalData.userInfo = {
          ...app.globalData.userInfo,
          ...data
        }
        wx.setStorageSync('userInfo', data)
      })
  },
  goSet() {
    if (!app.globalData.token) {
      wx.navigateTo({ url: `/pages/auth/index` })
      return
    }
    wx.navigateTo({ url: `/pages/my/set/index` })
  },
  onShowModal () {
    if (!app.globalData.token) {
      wx.navigateTo({ url: `/pages/auth/index` })
      return
    }
    this.setData({ show: true })
    this.getTabBar().setData({ isHidden: true })
  },
  onCancel () {
    this.setData({ show: false })
    this.getTabBar().setData({ isHidden: false })
  },
  onOk ({ detail }) {
    post('/member/set_member_data', {
      name: detail.name,
      gender: detail.gender,
      birthday: detail.birthday,
      parent_mobile: detail.parent_mobile,
      avatar: detail.avatar,
      school: detail.school,
      channel: detail.channel

    })
      .then(res => {
        app.globalData.userInfo = {
          ...app.globalData.userInfo,
          ...detail
        }
        this.setData({
          userInfo: {
            ...detail
          }
        })
        this.onCancel()
      })
  },
  goPage ({ currentTarget }) {
    if (!app.globalData.token) {
      const isOrder = currentTarget && currentTarget.dataset.url == '/pages/order/index' ? 1 : 0
      wx.navigateTo({ url: isOrder ? `/pages/auth/index?isOrder=1` : `/pages/auth/index` })
      return
    }
    if (!currentTarget) return
    const url = currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  },
  onGoPage () {
    wx.navigateTo({
      url: '/pages/my/buy/index'
    })
  },
  handleContact (e) {

  }
})
