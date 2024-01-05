import { get, post } from '../../utils/index'

const app = getApp()

Page({
  data: {
    userInfo: {},
    receive_status: 0,
    page: 1,
    dataSource: [],
    total: 0,
    defaultData: {
      title: "消息中心", // 导航栏标题
    }
  },
  onLoad (options) {
    this.handleGetUserInfo()
    this.handleGetList()
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  onPullDownRefresh () {
    this.setData({ page: 1 })
    this.handleGetList()
  },
  onReachBottom() {
    if (this.data.dataSource.length >= this.data.total) return
    this.setData({ page: this.data.page + 1 })
    this.handleGetList()
  },
  handleGetUserInfo() {
    get('/fan/info')
      .then(({ data }) => {
        this.setData({ userInfo: data })
      })
  },
  handleUpdateUserInfo() {
    wx.getUserProfile({ desc: '使用群抽奖助理' })
      .then(({ userInfo }) => {
        return post('/fan/putUserInfo', { ...userInfo })
      })
      .then(res => {
        wx.showToast({ title: '更新成功，请手动删除小程序后重新打开', icon: 'none' })
      })
  },
  handleGetList () {
    get('/index/lotteryWinList', {
      receive_status: this.data.receive_status,
      page: this.data.page,
      pagesize: 10
    }, {
      showLoading: true
    })
      .then(({ data }) => {
        const newDataSource = this.data.page === 1 ? data : this.data.dataSource.concat(data)
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
  handleChangeTab({ detail }) {
    this.setData({ receive_status: detail.index, page: 1 })
    this.handleGetList()
  },
});
