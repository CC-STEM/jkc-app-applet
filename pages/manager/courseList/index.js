import dayjs from "dayjs";
import { get } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'

Page ({
  data: {
    dataSource: [],
    defaultData: {
      title: '课表明细', // 导航栏标题
      hideShare: true
    },
    uploadUrlHost: uploadUrlHost,
    date: dayjs().format('YYYY-MM-DD'),
    fdate: dayjs().format('YYYY.MM.DD')
  },
  onLoad () {
    this.handleGetList()
  },
  onPullDownRefresh () {
    // this.setData({ 
    //   date: dayjs().format('YYYY-MM-DD'), 
    //   fdate: dayjs().format('YYYY.MM.DD')
    // })
    this.handleGetList()
  },
  bindPickerChange ({ detail }) {
    this.setData({ date: detail.value, fdate: dayjs(detail.value).format('YYYY.MM.DD') })
    this.handleGetList()
  },
  handleGetList () {
    get('/store_manager/store_curriculum', { 
      date: this.data.date
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
  onChangeTab ({ detail }) {
    const { defaultData } = this.data
    this.setData({
      defaultData: {
        ...defaultData,
        activeTab: detail.index
      }
    })
    this.handleGetList()
  }
})
