import dayjs from "dayjs";
import { get, post } from '../../utils/index'
import { uploadUrlHost } from '../../utils/constants'
import { loadPickerData, getCurrentDate, GetMultiIndex } from '../../utils/constants'
const app = getApp ()

Page ({
  data: {
    page: 1,
    dataSource: [],
    total: 0,
    defaultData: {
      title: '业绩详情' // 导航栏标题
    },
    uploadUrlHost: uploadUrlHost,
    type: 1,
    salaryTotal: {},
    typeMap: [
      { name: '常规班', value: 1, type: 1 },
      { name: '精品班', value: 1, type: 2 },
      { name: '代码编程', value: 1, type: 3 },
      { name: '商品', value: 1, type: 4 },
      { name: '会员卡', value: 1, type: 5 },
      { name: '特殊奖励', value: '...', type: 6 },
    ],
    date: [],
    dateIndex: 0,
    multiArray:[],//piker的item项
    multiIndex:[],//当前选择列的下标
    showTotal: true
  },
  onLoad (options) {
    this.getTotal()
  },
  onPullDownRefresh () {
    this.setData({ month: '' })
    this.getTotal()
  },
  onShowTotal () {
    this.setData({ showTotal: !this.data.showTotal })
  },
  onReachBottom () {
    if (this.data.dataSource.length >= this.data.total) return
    this.setData({ page: this.data.page + 1 })
    this.handleGetList()
  },
  onChange () {
    wx.reLaunch({ url: '/pages/my/index' })
  },
  bindDateChange (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  bindPickerChange (e) {
    this.setData({
      dateIndex: e.detail.value
    })
    this.getTotal()
  },
  getTotal () {
    const { dateIndex, date, typeMap } = this.data
    const params = {}
    if (date.length) {
      params.month = date[dateIndex]
    }
    get('/teacher_identity/salary_detailed', {
      ...params
    })
      .then(({ data }) => {
        this.setData({
          salaryTotal: { ...data },
          date: data.selected_month,
          typeMap: [
            { ...typeMap[0], value: data.commission1 },
            { ...typeMap[1], value: data.commission2 },
            { ...typeMap[2], value: data.commission3 },
            { ...typeMap[3], value: data.commission4 },
            { ...typeMap[4], value: data.commission5 },
            { ...typeMap[5], value: data.commission6 },
          ],
        })
        this.handleGetList()
      })
  },
  handleGetList () {
    const { type, salaryTotal } = this.data
    get('/teacher_identity/salary_detailed_list', {
      page: this.data.page,
      page_size: 20,
      id: salaryTotal.id,
      type
    }, {
      showLoading: true
    }).then(({ data }) => {
      const newDataSource = this.data.page === 1 ? data.list : this.data.dataSource.concat(data.list)

      this.setData({
        dataSource: newDataSource,
        total: data.page.count
      })
      if (this.data.page === 1) {
        wx.pageScrollTo({ scrollTop: 0 })
      }
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
