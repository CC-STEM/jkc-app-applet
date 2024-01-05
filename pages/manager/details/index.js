import dayjs from "dayjs";
import { get, post } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'
const app = getApp ()

Page ({
  data: {
    dataSource: [],
    defaultData: {
      title: '体验课详情', // 导航栏标题
      hideShare: true
    },
    uploadUrlHost: uploadUrlHost,
    date: dayjs().format('YYYY-MM-DD'),
    fdate: dayjs().format('YYYY.MM.DD')
  },
  onLoad (options) {
    this.handleGetList()
  },
  onPullDownRefresh () {
    // this.setData({ date: dayjs().format('YYYY-MM-DD'), fdate: dayjs().format('YYYY.MM.DD') })
    this.handleGetList()
  },
  onReachBottom () {
    this.handleGetList()
  },
  onChange () {
    wx.reLaunch({ url: '/pages/my/index' })
  },
  bindPickerChange ({ detail }) {
    this.setData({ date: detail.value, fdate: dayjs(detail.value).format('YYYY.MM.DD') })
    this.handleGetList()
  },
  handleGetList () {
    const { date } = this.data
    get('/store_manager/store_sample_course_offline', {
      date: date
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
})
