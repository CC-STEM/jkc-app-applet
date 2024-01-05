import dayjs from 'dayjs'
import { get, post } from '../../../utils/index'
import { uploadUrlHost, defaultAvatar } from '../../../utils/constants'

Page({
  data: {
    page: 1,
    dataSource: { },
    total: 0,
    defaultData: {
      title: '会员详情', // 导航栏标题
      noBgColor: true,
      type: 3,
      hideShare: true
    },
    uploadUrlHost: uploadUrlHost,
    show: false,
    id: '',
    curId: '',
    setData: {
      title: '延期',
      tips: '仅支持延期一次，请仔细确认后输入',
      placeholder: '请输入天数，最多180天',
      number: null
    },
    defaultAvatar: defaultAvatar
  },
  onLoad (options) {
    const { id } = options
    this.setData({ id })
    this.handleGetList()
  },
  onPullDownRefresh () {
    this.setData({ curId: '' })
    this.handleGetList()
  },
  onShowModal ({ currentTarget }) {
    const { id } = currentTarget.dataset
    this.setData({ show: true, curId: id })
  },
  onOk ({ detail }) {
    console.log('>>number', detail.number);
    const { curId } = this.data
    post('/store_manager/vip_card_order_extension', {
      days: detail.number,
      id: curId
    })
      .then(({ data }) => {
        this.handleGetList()
        this.onCancel()
      })
  },
  onCancel () {
    this.setData({ show: false })
  },
  handleGetList () {
    get('/store_manager/store_member_detail', {
      id: this.data.id
    })
      .then(({ data }) => {
        this.setData({
          dataSource: data
        })
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
