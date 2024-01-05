import dayjs from 'dayjs'
import { get, post } from '../../../utils/index'
import { uploadUrlHost, typeObj } from '../../../utils/constants'

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateString: '',
    spot: ['2022/5/6', '2022/5/9', '2022/5/20', '2022/5/12', '2022/6/1'],
    statusOptions: [{ key: 2, value: '全部教程' }, { key: 0, value: '待学习' }, { key: 1, value: '已学习' }],

    kw: null,
    status: 1,
    page: 1,
    dataSource: [],
    buttons: [
      { text: '取消' },
      { text: '确认' }
    ],
    defaultData: {
      showTab: true,
      activeTab: 0,
      type: 2,
      tabs: [{ key: 0, value: '待上课' }, { key: 1, value: '已上课' }]
    },
    isChoose: true,
    vipMap: [
      { title: '经典月卡', coin: '1000', money: '99' },
      { title: '钻石季卡', coin: '5000', money: '490' },
      { title: '黑金年卡', coin: '15000', money: '1490' }
    ],
    tagList: [{ key: 0, value: '0-2' }, { key: 1, value: '2-3' }, { key: 2, value: '4-5' }],
    show: false,
    uploadUrlHost: uploadUrlHost,
    curData: {},
    typeObj: typeObj
  },
  dateChange (e) {
    this.setData({
      dateString: e.detail.dateString
    })
    this.handleGetList()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    this.handleGetList()
  },
  handleGetList () {
    get('/offline_course_order/list', {
      status: this.data.defaultData.activeTab // 0 待上课，1 已上课
    })
      .then(({ data }) => {
        if (!data.list || !data.list.length) {
          this.setData({
            dataSource: []
          })
          return
        }
        this.setData({
          dataSource: data.list.map(item => ({
            date: `${dayjs(item.start_at).format('YYYY.MM.DD')}`,
            time: `${dayjs(item.start_at).format('HH:mm')}~${dayjs(item.end_at).format('HH:mm')}`,
            time1: `${dayjs(item.start_at).format('HH:mm')} 至 ${dayjs(item.end_at).format('HH:mm')}`,
            ...item
          }))
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onChangeTab ({ detail }) {
    const { defaultData } = this.data
    this.setData({
      defaultData: {
        ...defaultData,
        activeTab: detail.index
      }
    })
    this.handleGetList()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {
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
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
  },
  onReverse () {
    wx.switchTab({
      url: '/pages/offcourse/index'
    })
  },
  onCall ({ currentTarget }) {
    const { storephone } = currentTarget.dataset
    wx.makePhoneCall({
      phoneNumber: storephone
    })
  },
  onShowModal2 ({ currentTarget }) {
    const qrCode = currentTarget.dataset.qrCode
    this.setData({ showQrcode: true, qrCode: qrCode })
  },
  onShowModal ({ currentTarget }) {
    const item = currentTarget.dataset.item
    this.setData({ show: true, curData: { ...item } })
  },
  onCancel () {
    this.setData({ show: false, showQrcode: false, curData: {} })
  },
  onOk () {
    post('/offline_course_order/cancel', {
      id: this.data.curData.id
    })
      .then(({ data }) => {
        this.onCancel()
        this.handleGetList()
      })
  },
  // 查看图片
  onViewImage ({ currentTarget }) {
    const { imgs, url } = currentTarget.dataset
    wx.previewImage({
      urls: [url],
      current: url
    })
  }
})
