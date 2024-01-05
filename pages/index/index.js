import dayjs from "dayjs"
import { get, post, getAllParams } from '../../utils/index'
import { uploadUrlHost } from '../../utils/constants'

const app = getApp()

Page ({
  data: {
    page: 1,
    dataSource: [],
    total: 0,
    banner: [],
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 3000,
    duration: 500,
    defaultData: {
      title: 'CC编程', // 导航栏标题
      show: true,
      location: '',
      hideReturn: true
    },
    uploadUrlHost: uploadUrlHost,
    physicalStore: { },
    showQrcode: false,
    showLibao: false,
    show: false,
    showSilder: false,
    libaoData: {},
    isFirst: true
  },
  onLoad (options) {
    this.handleGetList()
    this.handleGetBanner()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0,
        showListIndex: app.globalData.tabBarList
      })
    }
  },
  onShow (options) {
    if (wx.getStorageSync('isManager') == 1) {
      wx.navigateTo({ url: '/pages/manager/index' })
      return
    }
    if (app.globalData.store && app.globalData.store.id) {
      this.setData({
        physicalStore: app.globalData.store
      })
    }
    this.getSetting()
   
    // 自定义tabbar需添加初始化代码
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0,
        showListIndex: app.globalData.tabBarList
      })
    }

    const shareData = wx.getStorageSync('SHAREDATA') || {}
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
    } else if (shareData.id) {
      params.id = shareData.id
      params.type = shareData.type
    }
    // 绑定分享者id 落地页 分享后进入小程序，未登录的shareid存储，登录时绑定
    // console.log('>>>index', params, shareData)
    if (params.id) {
      wx.setStorageSync('SHAREDATA', { ...params })
      post('/member/bind_superior', {
        ...params
      })
    }
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
  getNewcomer (id) {
    get('/vip_card/newcomer', {
      physical_store_id: id
    })
      .then(({ data }) => {
        this.setData({
          showSilder: !!data.id,
          libaoData: { ...data },
          isFirst: false
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
        // this.data.isFirst && 
        !this.data.showLibao && this.getNewcomer(data.id)
        this.setData({
          vipList: data.vip_card
        })
        if (!(app.globalData.store && app.globalData.store.id)) {
          this.setData({
            physicalStore: data
          })
        }
      })
  },
  onShowModalLibao () {
    this.getTabBar().setData({ isHidden: true })
    this.setData({ showLibao: true })
  },
  onShowModal2 () {
    this.getTabBar().setData({ isHidden: true })
    this.setData({ showQrcode: true })
  },
  onShowModal () {
    this.getTabBar().setData({ isHidden: true })
    this.setData({ show: true })
  },
  onReward () {
    post('/member/entrant_reward')
      .then(() => {
        this.onCancel()
        this.onHideModal()
      })
  },
  onOk ({ detail }) {
    this.setData({ curIndex: 0, physicalStore: detail.store })
    app.globalData.store = { ...detail.store }
    this.getNewcomer(detail.store.id)

    this.onCancel()
  },
  onCancel () {
    this.getTabBar().setData({ isHidden: false })
    this.setData({ show: false, showQrcode: false, showLibao: false })
  },
  onHideModal () {
    this.setData({ showSilder: false })
  },
  // handleGetList (id) {
  //   const { physicalStore, dateString } = this.data
  //   console.log('!!!-------------->>>>>handleGetList', physicalStore.id || id)

  //   if (!physicalStore.id && !id) return
  //   this.getPlan(physicalStore.id || id)
  //   get('/offline_course/store_course_plan', {
  //     physical_store_id: physicalStore.id || id,
  //     date: dateString
  //   }, {
  //     showLoading: true
  //   })
  //     .then(({ data }) => {
  //       let dataSource = data.length ? data[0].course : []
  //       dataSource = dataSource.map(item => ({
  //         ...item,
  //         isOver: dayjs(item.class_start_time).valueOf() < dayjs().valueOf()
  //       }))
  //       this.setData({
  //         totalData: data,
  //         tagList: data.map(item => item.tag),
  //         dataSource
  //       })
  //     })
  //     .finally(() => {
  //       wx.stopPullDownRefresh()
  //     })
  // },
  onCall () {
    wx.makePhoneCall({
      phoneNumber: this.data.physicalStore.store_phone // 仅为示例，并非真实的电话号码
    })
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
  },
  handleGetList () {
    get('/home/course', {
      page: this.data.page,
      page_size: 20
    }, {
      showLoading: true
    })
      .then(({ data }) => {
        const newDataSource = this.data.page === 1 ? data.list : this.data.dataSource.concat(data.list)
        this.setData({
          dataSource: newDataSource,
          total: data.page.count
        })
        if (this.data.page === 1) {
          wx.pageScrollTo({ scrollTop: 0 })
        }
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  handleGetBanner () {
    get('/home/banner')
      .then(({ data, pager }) => {
        this.setData({
          banner: data.list
        })
        wx.pageScrollTo({ scrollTop: 0 })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onReachBottom () {
    if (this.data.dataSource.length >= this.data.total) return
    this.setData({ page: this.data.page + 1 })
    this.handleGetList()
  },
  goOtherPage ({ currentTarget }) {
    const url = currentTarget.dataset.url
    if (!url) return
    wx.navigateTo({
      url: `/pages/other/index?url=${url}`
    })
  },
  onGoPage () {
    wx.switchTab({
      url: '/pages/offcourse/index'
    })
  },
  onShareAppMessage () {
    post('/behavior_record/share', { type: 1 })
      .then(res => {
      })
    return {
      title: 'CC编程，课程好 按月付，家长孩子两不误',
      path: `/pages/ground/index?id=${app.globalData.userInfo.id}&type=1`
    }
  }
})
