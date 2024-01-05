/**
 * Description
 * Created by yunsheng on 2021/1/27
**/
import { get, post, setToken } from './utils/index'

App({
  onLaunch (options) {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    // 胶囊按钮位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    // 导航栏高度 = 状态栏高度 + 98
    this.globalData.statusBarHeight = systemInfo.statusBarHeight
    this.globalData.navBarHeight = systemInfo.system.toLowerCase().indexOf('ios') > -1 ? 44 : 48
    this.globalData.menuRight = systemInfo.screenWidth - menuButtonInfo.right
    this.globalData.menuTop = menuButtonInfo.top
    this.globalData.menuHeight = menuButtonInfo.height

    // Do something initial when launch.
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })

    // 给Promise添加 finally方法
    Promise.prototype.finally = function (callback) {
      return this.then(
        value => Promise.resolve(callback()).then(() => value),
        reason => Promise.resolve(callback()).then(() => { throw reason })
      )
    }

    /**
     * 进入小程序调用一次login接口得到code
     * 登陆小程序接口获取token并设置到全局后续请求中
    */
    // wx.login()
    //   .then(({ code }) => {
    //     const params = { code }
    //     if (options.query.scene) {
    //       params.scene = decodeURIComponent(options.query.scene)
    //     }
    //     return post('/login/wxmini', params)
    //   })
    //   .then(({ data }) => {
    //     setToken(data.token)
    //     this.globalData.token = data.token
    //     this.globalData.identity = data.identity
    //     this.globalData.launching = data.mobile_bind
    //     if (data.mobile_bind == 0) {
    //       wx.navigateTo({ url: '/pages/auth/index' })
    //     } else {
    //       wx.switchTab({ url: '/pages/index/index' })
    //     }
    //   })
    //   .then(() => {
    //     get('/member/info').then(({ data }) => (
    //       this.globalData.userInfo = {
    //         ...this.globalData.userInfo,
    //         ...data
    //       }
    //     ))
    //   })
    //   .catch((res) => {
    //     console.log(res)
    //   })
  },
  onShow (options) {
  },
  onHide () {
    // Do something when hide.
  },
  onError (msg) {
    console.error(msg)
  },
  globalData: {
    token: wx.getStorageSync('TOKEN') || null,
    shareData: wx.getStorageSync('TOKEN') || null,
    addressData: {},
    userInfo: wx.getStorageSync('userInfo') || {
      age: null
    },
    latitude: 0,
    longitude: 0,
    identity: null,
    launching: 2, // 2 初始化 1 绑定过手机号 0 未绑定 => loading页面跳转用
    selected: 0,
    tabBarList: [0, 1, 2], // tab控制
    storeList: [], // 门店列表
    store: wx.getStorageSync('store') || {}, // 选择的门店
    reloadCfg: { // 有些页面跳转需要目标页刷新数据
      enable: false,
      options: null
    },
    createData: null, // 跳页面时暂时保存创建数据
    statusBarHeight: 0, // 状态栏高度
    navBarHeight: 0, // 导航栏高度
    menuRight: 0, // 胶囊距右方间距（方保持左、右间距一致）
    menuTop: 0, // 胶囊距底部间距（保持底部间距一致）
    menuHeight: 0 // 胶囊高度（自定义内容可与胶囊高度保证一致）
  }
})
