import dayjs from "dayjs";
import { get, post } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'

const app = getApp()

function getNeedDate (str) {
  return dayjs(str).format('MM月DD日')
}

function getNeedTime (str) {
  return dayjs(str).format('HH:mm')
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateString: '',
    spot: ['2022/5/6', '2022/5/9', '2022/5/20', '2022/5/12', '2022/6/1'],
    status: 1,
    page: 1,
    dataSource: {},
    total: 0,
    defaultData: {
      title: '课程安排详情',
      noBgColor: true
    },
    batchNo: '',
    details: { },
    uploadUrlHost: uploadUrlHost
  },
  dateChange (e) {
    this.setData({
      dateString: e.detail.dateString
    })
  },
  onLoad (options) {
    const { batchNo, id } = options
    batchNo && this.setData({ batchNo })
    id && this.setData({ id })
    this.handleGetList()
  },
  handleChangeTab ({ detail }) {
    this.setData({ status: detail.index, page: 1 })
    // this.handleGetList()
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
  },
  handleGetList () {
    get('/offline_course/package', {
      batch_no: this.data.batchNo,
      page: this.data.page,
      page_size: 10
    })
      .then(({ data }) => {
        const dataSource = data.list || {}
        dataSource.course = dataSource.course.map(item => ({
          ...item,
          time: getNeedTime(item.class_start_time),
          date: getNeedDate(item.class_start_time)
        }))
        this.setData({
          dataSource: dataSource
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onAdd () {
    post('/online_course/add_collect', {
      id: this.data.id
    })
      .then(({ data, pager }) => {
        this.handleGetList()
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  }
})
