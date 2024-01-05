import dayjs from "dayjs"
import { get, post, token } from '../../../utils/index'
import { uploadUrlHost, typeObj } from '../../../utils/constants'

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateString: '',
    spot: ['2022/5/6', '2022/5/9', '2022/5/20', '2022/5/12', '2022/6/1'],
    typeObj: typeObj,
    kw: null,
    status: 1,
    page: 1,
    dataSource: [],
    total: 0,
    defaultData: {
      title: '课程详情'
    },
    vipInfo: {},
    isChoose: true,
    vipMap: [
      { title: '经典月卡', coin: '1000', money: '99' },
      { title: '钻石季卡', coin: '5000', money: '490' },
      { title: '黑金年卡', coin: '15000', money: '1490' }
    ],
    tagList: [{ key: 0, value: '0-2' }, { key: 1, value: '2-3' }, { key: 2, value: '4-5' }],
    uploadUrlHost: uploadUrlHost,
    showConfirm: false, // 次数不够提示
    confirmData: {
      title: '温馨提示',
      content: '课程余额次数不足,请及时购买课程',
      cancelText: '取消',
      okText: '购买课包'
    },
    token: null
  },
  dateChange (e) {
    this.setData({
      dateString: e.detail.dateString
    })
  },
  onShow () {
    if (app.globalData.token) {
      this.setData({ token: app.globalData.token })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    const { id } = options
    this.setData({ id })
    this.handleGetList()
    this.getMemberInfo()
  },
  goPage() {
    if (!app.globalData.token) {
      wx.navigateTo({ url: `/pages/auth/index` })
    }
  },
  handleGetList () {
    get('/offline_course/plan_detail', {
      id: this.data.id
    })
      .then(({ data }) => {
        const dataSource = {
          ...data,
          isOver: dayjs(data.class_start_time).valueOf() < dayjs().valueOf()
        }
        this.setData({
          dataSource
        })
        wx.pageScrollTo({ scrollTop: 0 })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
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
  handleChangeTab ({ detail }) {
    this.setData({ status: detail.index, page: 1 })
    // this.handleGetList()
  },
  onSubmit () {
    if (!app.globalData.token) {
      wx.navigateTo({ url: `/pages/auth/index` })
      return
    }
    const { dataSource, vipInfo } = this.data
    if ((dataSource.type == 1 && Number(vipInfo.course1) < 1) || (dataSource.type == 2 && Number(vipInfo.course2) < 1) || (dataSource.type == 3 && Number(vipInfo.course3) < 1)) {
      this.setData({
        showConfirm: true
      })
      return
    }
    wx.navigateTo({ url: `/pages/offcourse/order/index?batchNos=${JSON.stringify([dataSource.batch_no])}&ids=${JSON.stringify([dataSource.id])}&type=${dataSource.type}` })
  },
  onBuy () {
    wx.navigateTo({
      url: `/pages/my/buy/index?courseType=${this.data.curCourseType}`
    })
    this.onCancel()
  },
  onCancel () {
    this.setData({ showConfirm: false })
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
  },
  onCall () {
    wx.makePhoneCall({
      phoneNumber: this.data.dataSource.store_phone // 仅为示例，并非真实的电话号码
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {

  }
})