import dayjs from "dayjs";
import { uploadUrlHost } from '../../../utils/constants'
import { get, post } from '../../../utils/index'

const app = getApp()

Page ({
  data: {
    status: 1,
    page: 1,
    dataSource: {},
    defaultData: {
      title: '课程信息'
    },
    uploadUrlHost: uploadUrlHost
  },
  onLoad (options) {
    const { id } = options
    id && this.setData({ id })
    this.handleGetList()
    this.handleGetDetails()
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
  },
  onReachBottom () {
  },
  handleGetList () {
    get('/online_course/detail', {
      id: this.data.id
    }, {
      showLoading: true
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
  handleGetDetails () {
    get('/online_course/detail', {
      id: this.data.id
    })
      .then(({ data, pager }) => {
        this.setData({
          details: data
        })
      })
  },
  onAdd () {
    post('/online_course/add_collect', {
      id: this.data.id
    })
      .then(({ data }) => {
        wx.showToast({ title: '添加成功', icon: 'none' })
        this.onReturn()
      })
  },
  onReturn () {
    wx.navigateBack({
      delta: 1
    })
  }
})
