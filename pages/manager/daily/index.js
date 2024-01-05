import dayjs from "dayjs";
import { get, post } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'
const app = getApp ()

Page ({
  data: {
    dataSource: [],
    defaultData: {
      title: '每日明细', // 导航栏标题
      hideShare: true
      // noBgColor: true,
    },
    uploadUrlHost: uploadUrlHost,
    date: dayjs().format('YYYY-MM-DD'),
    fdate: dayjs().format('YYYY.MM.DD'),
    type: '', // 2退款列表
    filter: {
      type1: '',
      title1: '业绩归属',
      hide2: true
    },
    number: ''
  },
  onLoad (options) {
    options.type && this.setData({ type: options.type })
    if (options.date) {
      const arr = options.date.split('.')
      this.setData({
        fdate: options.date,
        date: arr.join('-')
      })
    }
    this.handleGetList()
  },
  onPullDownRefresh () {
    this.handleGetList()
  },
  bindPickerChange ({ detail }) {
    this.setData({ date: detail.value, fdate: dayjs(detail.value).format('YYYY.MM.DD') })
    this.handleGetList()
  },
  formInputChange ({ currentTarget, detail }) {
    const field = currentTarget.dataset && currentTarget.dataset.field
    this.setData({ number: detail.value })
    this.handleGetList()
  },
  onShowModal () {
    this.setData({ show: true })
  },
  onOk ({ detail }) {
    this.setData({
      filter: {
        ...this.data.filter,
        type1: detail.type1
      }
    })
    this.handleGetList()
  },
  onCancel () {
    this.setData({ show: false })
  },
  handleGetList () {
    const { date, type, filter, number } = this.data
    get('/store_manager/store_daily_detail', {
      date,
      type,
      teacher_id: filter.type1,
      keywords: number
    }, {
      showLoading: true
    }).then(({ data }) => {
      this.setData({
        dataSource: data.list
      })
    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  // onShowName ({ currentTarget }) {
  //   wx.showToast({
  //     title: currentTarget.dataset.name || '无',
  //     icon: 'none',
  //   });
  // }
})
