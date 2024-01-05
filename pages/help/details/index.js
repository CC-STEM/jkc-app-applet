import { get, post } from '../../../utils/index'

const app = getApp()

Page({
  data: {
    userInfo: {},
    receive_status: 0,
    page: 1,
    dataSource: {},
    total: 0,
    defaultData: {
      title: '详情' // 导航栏标题
    }
  },
  onLoad (options) {
    const { id, img } = options
    this.setData({ id, img })
    this.handleGetList(id)
  },
  onPullDownRefresh () {
    this.handleGetList()
  },
  onReachBottom() {
  },
  handleGetList() {
    get('/article/detail', {
      id: this.data.id
    }, {
      showLoading: true
    })
      .then(({ data, pager}) => {
        this.setData({
          dataSource: data
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  handleChangeTab ({ detail }) {
    this.setData({ receive_status: detail.index, page: 1 })
    this.handleGetList()
  },
});
