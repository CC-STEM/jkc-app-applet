import dayjs from "dayjs";
import { get, post } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'
const app = getApp ()

Page ({
  data: {
    dataSource: [],
    defaultData: {
      title: '每日汇总', // 导航栏标题
      hideShare: true
      // noBgColor: true,
    },
    uploadUrlHost: uploadUrlHost,
    date: dayjs().format('YYYY-MM'),
    fdate: dayjs().format('YYYY.MM')
  },
  onLoad (options) {
    console.log('>>date', this.data.date)
    this.handleGetList()
  },
  onPullDownRefresh () {
    this.handleGetList()
  },
  bindPickerChange ({ detail }) {
    this.setData({ date: detail.value, fdate: dayjs(detail.value).format('YYYY.MM') })
    this.handleGetList()
  },
  handleGetList () {
    const { date } = this.data
    get('/store_manager/store_daily_statistics', {
      month: date
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
  onChangeType ({ currentTarget }) {
    const index = currentTarget.dataset.index + 1
    if (this.data.type === index) return
    this.setData({
      type: index
    })
    this.handleGetList()
  },
  onCopy ({ currentTarget }) {
    const number = currentTarget.dataset.number
    wx.setClipboardData({ data: number })
  },
})
