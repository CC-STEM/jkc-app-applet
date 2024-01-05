import dayjs from "dayjs";
import { get, post } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'

const app = getApp()

Page ({
  data: {
    page: 1,
    dataSource: [],
    total: 0,
    buttons: [
      { text: '取消' },
      { text: '确认' }
    ],
    defaultData: {
      title: '线上课程'
    },
    isChoose: true,
    id: '',
    category: null,
    suitAge: null,
    showCate: false,
    showPrice: false,
    uploadUrlHost: uploadUrlHost
  },
  onLoad (options) {
    const { id } = options
    id && this.setData({ id })
    this.handleGetList()
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
  },
  onReachBottom () {
    if (this.data.dataSource.length >= this.data.total) return
    this.setData({ page: this.data.page + 1 })
    this.handleGetList()
  },
  handleGetList () {
    const { category, suitAge } = this.data
    const params = {
      page: this.data.page,
      page_size: 10
    }
    if (category) {
      params.course_category_id = category
    }
    if (suitAge) {
      params.suit_age = suitAge
    }
    get('/online_course/list', params, {
      showLoading: true
    })
      .then(({ data }) => {
        const newDataSource = this.data.page === 1 ? data.list : this.data.dataSource.concat(data.list)
        this.setData({
          dataSource: newDataSource,
          total: data.page.count
        })
        if (this.data.page === 1) {
          wx.pageScrollTo({ scrollTop: 0 })
        }
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onShowModal () {
    this.setData({ showCate: true })
  },
  onCancel () {
    this.setData({ showCate: false })
  },
  onOk ({ detail }) {
    this.setData({ [detail.type]: detail.value, showCate: false })
    this.handleGetList()
  }
})
