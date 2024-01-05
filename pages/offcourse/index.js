/* eslint-disable node/handle-callback-err */
import dayjs from 'dayjs'
import { get, post, token } from '../../utils/index'
import { uploadUrlHost, typeObj, suitAgeMap } from '../../utils/constants'

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeObj: typeObj,
    kw: null,
    status: 1,
    page: 1,
    dataSource: [],
    dateString: '',
    spot: [],
    vipList: [],
    physicalStore: { },
    total: 0,
    defaultData: {
      title: '线下约课',
      hideReturn: true
    },
    isChoose: true,
    typeList: [{ url: '/pages/plan/index', title: '学习计划', desc: '有计划的学习更高效' }, { url: '/pages/poster/index', title: '推荐好友', desc: '奖励课程抵扣券' }],
    vipMap: [
      { title: '经典月卡', coin: '1000', money: '99' },
      { title: '钻石季卡', coin: '5000', money: '490' },
      { title: '黑金年卡', coin: '15000', money: '1490' }
    ], // 套餐
    vipInfo: {}, // 会员卡信息
    totalData: [],
    tagList: [],
    allAges: {},
    curIndex: null, // 年龄tag
    show: false,
    showQrcode: false,
    showReverse: false, // 约课
    showConfirm: false, // 次数不够提示
    uploadUrlHost: uploadUrlHost,
    curType: 0, // 常规班
    typeMap: [{ key: 0, value: '常规班' }, { key: 1, value: '精品小班' }, { key: 2, value: '代码编程' }, { key: 3, value: '主题科创班' }],
    curData: {},
    confirmData: {
      title: '温馨提示',
      content: '课程余额次数不足,请及时购买课程',
      cancelText: '取消',
      okText: '购买课包'
    },
    currencyCourse: 0, // 体验课次数
    curCourseType: '', // 当前课程type
  },
  dateChange (e) {
    this.setData({
      dateString: e.detail.dateString
    })
    this.getPlan()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow (options) {
    this.handleGetUserInfo()
    // 自定义tabbar需添加初始化代码
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1,
        showListIndex: app.globalData.tabBarList
      })
    }
    this.getSetting()
    this.getMemberInfo()
    this.getDetailSetList()
    this.getMemberSample()
    this.getAges()

    // 绑定上级 有koken在进行绑定
    if (getCurrentPages()[0].options.id && getCurrentPages()[0].options.id != 'undefined') {
      app.globalData.shareData = {
        id: getCurrentPages()[0].options.id,
        type: getCurrentPages()[0].options.type,
      }
      post('/member/bind_superior', {
        ...app.globalData.shareData
      }).then(() => {
      })
    }
    wx.setStorageSync('SHAREDATA', app.globalData.shareData)
  },
  onLoad (options) {
    const { isBuy } = options
    if (isBuy == 1) {
      wx.showToast({ title: '您已成功购买体验卡，请尽快约课吧！', icon: 'none' })
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
  getAges () {
    const { curType } = this.data
    get('/offline_course/age_tag')
      .then(({ data }) => {
        this.setData({
          allAges: data || {},
          tagList: data[curType + 1].length ? data[curType + 1] : suitAgeMap
        })
      })
  },
  getNewcomer (id) {
    get('/vip_card/newcomer', {
      physical_store_id: id
    })
      .then(({ data }) => {
        this.setData({
          showSilder: !!data.id,
          libaoData: { ...data }
        })
      })
  },
  getStoreDetails (obj) {
    if (app.globalData.store && app.globalData.store.id) {
      this.setData({ physicalStore: app.globalData.store })
      this.getPlan(app.globalData.store.id)
      return
    }
    get('/store/detail', { ...obj }, {
      showLoading: true
    })
      .then(({ data }) => {
        this.setData({
          physicalStore: data
        })
        this.getPlan(data.id)
      })
  },
  handleGetList (id) {
    const { physicalStore, dateString, curIndex, tagList, curType, allAges } = this.data
    const params = {
      physical_store_id: physicalStore.id || id,
      date: dateString,
      type: curType + 1,
      suit_age: ''
    }
    console.log('>>>allAges', allAges, curType, curIndex)
    if (tagList[curIndex]) {
      params.suit_age = tagList[curIndex].suit_age
    }
    get('/offline_course/store_course_plan', params)
      .then(({ data }) => {
        let dataSource = data.list || []
        dataSource = dataSource.map(item => ({
          ...item,
          isOver: dayjs(item.class_start_time).valueOf() < dayjs().valueOf()
        }))
        this.setData({
          dataSource
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  getPlan (id) {
    const { physicalStore, spot, curType } = this.data
    if (!physicalStore.id && !id) return
    if (spot.length) {
      this.handleGetList()
      return
    }
    get('/offline_course/store_course_plan_calendar', {
      physical_store_id: physicalStore.id || id,
      theme_type: curType + 1
    })
      .then(({ data }) => {
        this.setData({
          spot: data || [],
          dateString: data.length ? data[0] : ''
        })
        if (data.length) {
          this.handleGetList()
        } else {
          this.setData({
            dataSource: []
          })
        }
      })
  },
  getMemberSample () {
    get('/member/sample_vip_card')
      .then(({ data }) => {
        this.setData({
          currencyCourse: data.currency_course
        })
      })
  },
  getMemberInfo () {
    get('/member/vip_card')
      .then(({ data }) => {
        this.setData({
          vipInfo: data
        })
      })
  },
  getDetailSetList () {
    get('/offline_course/course_detail_set_up_list')
      .then(({ data }) => {
        this.setData({
          vipList: data.list
        })
      })
  },
  onChangeTag ({ currentTarget }) {
    const index = currentTarget.dataset.index
    if (this.data.curIndex === index) return
    this.setData({
      curIndex: index
    })
    this.handleGetList()
  },
  goPage ({ currentTarget }) {
    const url = currentTarget.dataset.url

    if (!app.globalData.token) {
      wx.navigateTo({ url: `/pages/auth/index` })
      return
    }
    wx.navigateTo({
      url: url
    })
  },
  handleChangeType ({ detail }) {
    const { allAges } = this.data
    this.setData({ curType: detail.index, tagList: allAges[detail.index + 1] && allAges[detail.index + 1].length ? allAges[detail.index + 1] : suitAgeMap, page: 1, curIndex: null, spot: [] })
    if (detail.index < 3) {
      this.getPlan()
    }
  },
  onShowDialog () {
    this.getTabBar().setData({ isHidden: true })
    this.setData({
      show: true
    })
  },
  bindButtonTap () {

  },
  bindClose () {
    this.setData({
      show: false
    })
  },
  onPullDownRefresh () {
    this.getPlan()
  },
  onCall () {
    wx.makePhoneCall({
      phoneNumber: this.data.physicalStore.store_phone // 仅为示例，并非真实的电话号码
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {

  },
  onShowModal2 () {
    this.getTabBar().setData({ isHidden: true })
    this.setData({ showQrcode: true })
  },
  onShowModal () {
    this.getTabBar().setData({ isHidden: true })
    this.setData({ show: true })
  },
  onCancel () {
    this.getTabBar().setData({ isHidden: false })
    this.setData({ show: false, showQrcode: false, showReverse: false, showConfirm: false, curData: {} })
  },
  onOk ({ detail }) {
    this.getTabBar().setData({ isHidden: true })
    this.setData({ curIndex: null, physicalStore: detail.store, dateString: '', spot: [], curType: 0 })
    this.getAges()
    this.getPlan()
  },
  onOkReverse ({ detail }) {
    const { curData, vipInfo } = this.data
    const { selectedList, batchNoList, themeType } = detail
    this.getTabBar().setData({ isHidden: true })
    this.setData({ themeType })
    // 会员卡次数不够提示去充值
    if ((curData.type == 1 && Number(vipInfo.course1) < selectedList.length) || (curData.type == 2 && Number(vipInfo.course2) < selectedList.length) || (curData.type == 3 && Number(vipInfo.course3) < selectedList.length)) {
      this.setData({
        showConfirm: true
      })
      return
    }
    this.onCancel()
    wx.navigateTo({ url: `/pages/offcourse/order/index?type=${curData.type}&ids=${JSON.stringify(selectedList)}&batchNos=${JSON.stringify(batchNoList)}&themeType=${themeType}` })
  },
  onExperience ({ currentTarget }) {
    if (!app.globalData.token) {
      wx.navigateTo({ url: `/pages/auth/index` })
      return
    }
    const item = currentTarget.dataset.item
    this.setData({ isSample: 1 })
    wx.navigateTo({ url: `/pages/offcourse/order/index?type=${item.type}&isSample=1&ids=${JSON.stringify([item.id])}` })
  },
  onReverse ({ currentTarget }) {
    if (!app.globalData.token) {
      wx.navigateTo({ url: `/pages/auth/index` })
      return
    }
    this.getTabBar().setData({ isHidden: true })
    const item = currentTarget.dataset.item
    const vipInfo = this.data.vipInfo
    // 会员卡次数不够提示去充值
    if (vipInfo.course1 <= 0 && vipInfo.course2 <= 0 && vipInfo.course3 <= 0) {
      this.setData({
        showConfirm: true,
        curCourseType: item.type
      })
      return
    }
    this.setData({
      curData: {
        ...item,
        physical_store_id: this.data.physicalStore.id
      },
      showReverse: true
    })
  },
  onBuy () {
    wx.navigateTo({
      url: `/pages/my/buy/index?courseType=${this.data.curCourseType}`
    })
    this.onCancel()
  },
  onReport () {
    const { curIndex, curType, tagList } = this.data
    // 1 精品小班，2 代码编程 3主题科创班，4 学习计划
    post('/study_plan/enrollment', {
      type: curType == 0 && curIndex >= 6 ? tagList[curIndex].describe : curType
    })
      .then(({ data }) => {
        wx.showToast({
          title: '报名成功'
        })
      })
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
  onShareAppMessage () {
    post('/behavior_record/share', { type: 1 })
      .then(res => {
      })
    return {
      title: 'CC编程，课程好 按月付，家长孩子两不误',
      path: `/pages/offcourse/index?id=${app.globalData.userInfo.id}&type=1`
    }
  }
})
