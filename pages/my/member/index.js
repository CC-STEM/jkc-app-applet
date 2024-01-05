import dayjs from 'dayjs'
import { get, post } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'

const app = getApp()

Page({
  data: {
    userInfo: {},
    page: 1,
    dataSource: { },
    total: 0,
    defaultData: {
      title: '消费记录', // 导航栏标题
      noBgColor: true,
      isWhite: true
    },
    list: [],
    uploadUrlHost: uploadUrlHost,
    typeObj: { 0: '全部课程皆', 1: '常规班', 2: '精品小班', 3: '代码编程' },
    showConfirm: false,
    stores: '',
    confirmData: {
      title: '可使用门店',
      content: '',
      okText: '我知道了',
      hideCancel: true
    },
  },
  onLoad (options) {
    this.handleGetUserInfo()
    this.handleGetList()
  },
  onPullDownRefresh () {
    // this.setData({ page: 1 })
    // this.handleGetList()
  },
  onReachBottom() {
  },
  handleGetUserInfo () {
    get('/member/center')
      .then(({ data }) => {
        this.setData({ userInfo: data })
      })
  },
  onShowModal ({ currentTarget }) {
    const { stores } = currentTarget.dataset
    this.setData({
      showConfirm: true,
      confirmData: { 
        ...this.data.confirmData,
        content: stores.join('、')
      } 
    })
  },
  onCancel () {
    this.setData({ showConfirm: false })
  },
  handleGetList () {
    get('/vip_card/order_list', {
      page: this.data.page,
      pagesize: 10
    })
      .then(({ data }) => {
        let newDataSource = this.data.page === 1 ? data.list : this.data.dataSource.concat(data.list)
        newDataSource = newDataSource.map(item => ({
          ...item,
          physical_store1: item.physical_store.join('、'),
          expire_at: item.expire_at ? dayjs(item.expire_at).format('YYYY.MM.DD') : ''
        }))
        this.setData({
          dataSource: newDataSource
        })
        if (this.data.page === 1) {
          wx.pageScrollTo({ scrollTop: 0 })
        }
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onGoPage () {
    wx.switchTab({
      url: '/pages/offcourse/index'
    })
  }
})
