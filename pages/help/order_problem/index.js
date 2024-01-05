import { get, post } from '../../../utils/index'

const app = getApp ()

Page({
  data: {
    page: 1,
    dataSource: [],
    total: 0,
    defaultData: {
      title: '订单问题' // 导航栏标题
    }
  },
  onLoad (options) {
    const { id, name, img } = options
    this.setData({
      id,
      img,
      defaultData: {
        title: name
      }
    })
    this.handleGetList()
  },
  onPullDownRefresh  () {
    this.setData({ page: 1 })
    this.handleGetList()
  },
  onReachBottom () {
    if (this.data.dataSource.length >= this.data.total) return
    this.setData({ page: this.data.page + 1 })
    this.handleGetList()
  },
  handleGetList () {
    get('/article/list', {
      article_theme_id: this.data.id,
      page: this.data.page,
      page_size: 10
    }, {
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
  }
});
