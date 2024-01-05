import { get, post, token } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'

const app = getApp()

Page({
  data: {
    userInfo: {},
    receive_status: 0,
    dataSource: [],
    storeList: [],
    defaultData: {
      buy: true,
      type: 1,
      title: '购卡开通会员',
      isWhite: true
    },
    // ageRangeArr: ['幼儿版2-6岁', '少儿版7-12岁'],
    // ageArr: [{ name: '幼儿版', desc: '2-6岁', value: '2-6' }, { name: '少儿版', desc: '7-12岁', value: '7-12' }],
    // type: 0, // 0 幼儿版 1 少儿版
    vipList: [{ key: 0, value: '经典月卡' }, { key: 1, value: '钻石季卡' }, { key: 2, value: '黑金年卡' }],
    show: false,
    physicalStore: {},
    uploadUrlHost: uploadUrlHost,
    number: '',
    showConfirm: false,
    confirmData: {
      title: '购买成功',
      content: '您已成功购买会员卡，赶快报名约课吧！',
      cancelText: '留在本页',
      okText: '去约课'
    },
    id: null,
    list: [],
    outTabs: [{ key: 'theme1', value: '常规班' }, { key: 'theme2', value: '精品小班' }, { key: 'theme3', value: '代码编程' }],
    tabs: [{ key: 'child', value: '幼儿版', desc: '3-7岁' }, { key: 'juvenile', value: '少儿版', desc: '7-15岁' }],
    tabs1: [{ key: 'child', value: 'Python' }, { key: 'juvenile', value: '信奥赛(C++)' }],
    showTab: true,
    active: 0,
    activeTab: 'child', // 0 幼儿版 1 少儿版 juvenile
    outActiveTab: 'theme1',
    couponData: [],
    showCoupon: false,
    curCoupon: {},
    isChooseCoupon: false, // 除了主动选择的时候穿coupon_id 其他切换type时候都不传
    jianData: [],
    showJian: false,
    curJian: [],
    allData: {}, // 所有优惠券的data
    amount: 0,
    pay: 1, // 1 微信，2 支付宝 3代付
    showPay: false,
    payUrl: '',
    isUsed: true, //是否使用优惠券
    isJianUsed: true, // 是否使用减免券
    isOpen: 1 // 1 开业/0未开业
  },
  onShow() {
    if (app.globalData.userInfo && app.globalData.userInfo.name) {
      this.setData({ userInfo: app.globalData.userInfo })
    }
    if (app.globalData.store && app.globalData.store.id) {
      this.setData({
        physicalStore: app.globalData.store
      })
    } 

    this.handleGetUserInfo()
    
    get('/member/info').then(({ data }) => (
      app.globalData.userInfo = {
        ...app.globalData.userInfo,
        ...data
      }
    ))

    this.getSetting()
   
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
    const { id, outActiveTab, activeTab } = options
    id && this.setData({ id })
    activeTab && this.setData({ activeTab })
    outActiveTab && this.setData({ outActiveTab })
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
      }
    })
  },
  getStoreDetails (obj) {
    if (app.globalData.store && app.globalData.store.id) {
      this.handleGetList(app.globalData.store.id)
      this.setData({
        physicalStore: app.globalData.store,
        vipList: app.globalData.store.vip_card
      })
      return 
    }
    get('/store/detail', {
      ...obj
    }, {
      showLoading: true
    })
      .then(({ data }) => {
        this.handleGetList(data.id)
        this.setData({
          vipList: data.vip_card,
          physicalStore: data
        })
      })
  },
  formInputChange ({ currentTarget, detail }) {
    const field = currentTarget.dataset && currentTarget.dataset.field
    this.setData({ number: detail.value })
  },
  onSetCode () {
    post('/member/set_referral_code', {
      referral_code: this.data.number
    })
      .then(res => {
        wx.showToast({
          title: '设置成功'
        })
      })
  },
  handleGetUserInfo () {
    if (app.globalData.userInfo.name) return
    get('/member/center')
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
  onPullDownRefresh () {
    this.setData({
      active: 0,
      activeTab: 'child', // 0 幼儿版 1 少儿版 juvenile
      outActiveTab: 'theme1',
    })
    this.getSetting()
  },
  onReachBottom () {
  },
  handleCoupon () {
    const { list, outActiveTab, activeTab, active, curCoupon = {}, isUsed, physicalStore, curJian, isJianUsed, isChooseCoupon } = this.data
    if (!list[outActiveTab][activeTab].length) {
      this.setData({
        isUsed: true,
        isJianUsed: true,
        curCoupon: {},
        amount: 0,
        couponData: [],
        jianData: [],
        curJian: [],
        allData: {}
      })
      return
    }
    const params = {
      id: list[outActiveTab][activeTab][active].id,
      physical_store_id: physicalStore.id,
      discount_ticket: !isJianUsed ? -1 : [...curJian]
    }

    if (isChooseCoupon && curCoupon.id) {
      params.coupon_id = curCoupon.id
    } 
    
    if (!isUsed) {
      params.coupon_id = -1
    }

    post('/vip_card/confirm', {...params }, {
      json: true
    })
      .then(({ data, code, msg }) => {
        this.setData({
          allData: data,
          amount: data.amount,
          couponData: data.coupon_list,
          curCoupon: data.selected_coupon,
          jianData: data.discount_ticket_list,
          curJian: data.discount_ticket_list.filter(item => item.selected == 1).map(item => item.id),
        })
        if (!code && msg) {
          wx.showToast({
            title: msg,
            icon: 'none'
          })
        }
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  handleGetList (storeId) {
    get('/vip_card/list', { 
      physical_store_id: storeId
    })
      .then(({ data = [] }) => {
        const { outTabs, outActiveTab, activeTab, id } = this.data

        console.log('>>vip_card', outTabs, data.theme_list)
        // 最外侧type展示过滤
        let _outTabs = [] 
        // Object.keys(data.theme_list).forEach((key, index) => {
        //   if (key == outTabs[index].key) {
        //     _outTabs.push(outTabs[index])
        //   }
        // })
        Object.keys(data.theme_list).forEach(item => {
          const index = outTabs.findIndex(tab => tab.key == item)
          console.log('>>index', index)

          if (index > -1) {
            _outTabs.push(outTabs[index])
          }
        })
       
       console.log('>>>_outTabs', _outTabs)
        const curList = data.theme_list[outActiveTab][activeTab]
        let _index = 0
        if (id) {
          _index = curList.findIndex(item => item.id == id)
        }

        this.setData({
          list: data.theme_list,
          outTabs: [..._outTabs],
          active: _index == -1 ? 0 : _index,
          isOpen: data.is_open
        })
        this.handleCoupon()
      }).finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onBuy () {
    const { active, number, physicalStore, curCoupon, pay, list, outActiveTab, activeTab, curJian } = this.data
    if (!list[outActiveTab][activeTab].length) {
      return
    }
    const params = {
      id: list[outActiveTab][activeTab][active].id,
      recommend_code: number,
      physical_store_id: physicalStore.id,
      payment_type: pay == 3 ? 2 : pay
    }
    if (curCoupon.id) {
      params.coupon_id = curCoupon.id
    }
    if (curJian.length) {
      params.discount_ticket = [...curJian]
    }
    post('/vip_card/buy', {
      ...params
    }, {
      json: true
    })
      .then(({ data }) => {
        if (data.body == 'zero') {
          this.setData({ showConfirm: true })
          return
        }
        if (pay == 2 || pay == 3) {
          this.setData({ showPay: true, payUrl: data.body })
          return
        }

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
            this.setData({ showConfirm: true })
          },
          fail: (res) => {
            console.log(res, '>>>fail')
          }
        })
      })
  },
  onChangeTab ({ currentTarget }) {
    const { vipList, active } = this.data
    const index = currentTarget.dataset.index
    if (active === index) return

    this.setData({
      active: index,
      isChooseCoupon: false
    })
    this.handleCoupon()
  },
  handleChangeType({ currentTarget }) {
    const { outActiveTab } = this.data
    const key = currentTarget.dataset.key
    if (outActiveTab === key) return
    this.setData({  
      outActiveTab: key,
      activeTab: 'child',
      active: 0,
      isUsed: true,
      isChooseCoupon: false
    })
    this.handleCoupon()
  },
  handleChangeData ({ currentTarget }) {
    const { activeTab } = this.data
    const key = currentTarget.dataset.key
    if (activeTab === key) return

    this.setData({ 
      activeTab: key,
      active: 0,
      isUsed: true,
      isChooseCoupon: false
    })
    this.handleCoupon()
  },
  onChangePay({ currentTarget }) {
    const type = currentTarget.dataset.type
    this.setData({ pay: type })
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
  onShowModal () {
    this.setData({ show: true })
  },
  onCancel () {
    this.setData({ show: false, showConfirm: false, showCoupon: false, showPay: false, showJian: false })
  },
  onOk ({ detail }) {
    this.setData({ 
      physicalStore: detail.store,
      active: 0,
      activeTab: 'child', // 0 幼儿版 1 少儿版 juvenile
      outActiveTab: 'theme1',
      isOpen: 1,
      outTabs: [{ key: 'theme1', value: '常规班' }, { key: 'theme2', value: '精品小班' }, { key: 'theme3', value: '代码编程' }],
    })
    app.globalData.store = { ...detail.store }
    this.handleGetList(detail.store.id)
  },
  onCheck () {
    this.onCancel()
    wx.switchTab({ url: '/pages/offcourse/index' })
  },
  onShowCoupon() {
    this.setData({ showCoupon: true })
  },
  onSelectCoupon({ detail }) {
    this.setData({ curCoupon: detail.coupon })
    this.setData({
      isUsed: detail.coupon.id,
      isChooseCoupon: true
    })
    this.handleCoupon()
    this.onCancel()
  },
  onShowJian() {
    this.setData({ showJian: true })
  },
  onSelectJian({ detail }) {
    this.setData({ curJian: detail.coupon, jianData: detail.list })
    this.setData({
      isJianUsed: !!detail.coupon.length,
      isChooseCoupon: true
    })
    this.handleCoupon()
    // this.onCancel()
  },
  onShareAppMessage () {
    post('/behavior_record/share', { type: 1 })
      .then(res => {
      })
    return {
      title: 'CC编程，课程好 按月付，家长孩子两不误',
      path: `/pages/my/buy/index?id=${app.globalData.userInfo.id}&type=1`
    }
  }
})
