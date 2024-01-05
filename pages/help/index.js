import { get, post } from '../../utils/index'
import { uploadUrlHost } from '../../utils/constants'

const app = getApp()

Page({
  data: {
    userInfo: {},
    receive_status: 0,
    page: 1,
    dataSource: [],
    total: 0,
    defaultData: {
      title: '帮助中心' // 导航栏标题
    },
    list: [
      { title: '账号问题', icon: 'help-icon2', data: [{ label: '如何开通账户？', id: 1 }, { label: '哪些证件可以用来开户？', id: 2 }, { label: '如何更新账户资料？', id: 3 }] },
      { title: '订单问题', icon: 'help-icon3', data: [{ label: '如何开通账户？', id: 1 }, { label: '哪些证件可以用来开户？', id: 2 }, { label: '如何更新账户资料？', id: 3 }] },
      { title: '线下约课', icon: 'help-icon4', data: [{ label: '如何开通账户？', id: 1 }, { label: '哪些证件可以用来开户？', id: 2 }, { label: '如何更新账户资料？', id: 3 }] },
      { title: '物流问题', icon: 'help-icon5', data: [{ label: '如何开通账户？', id: 1 }, { label: '哪些证件可以用来开户？', id: 2 }, { label: '如何更新账户资料？', id: 3 }] },
      { title: '平台问题', icon: 'help-icon6', data: [{ label: '如何开通账户？', id: 1 }, { label: '哪些证件可以用来开户？', id: 2 }, { label: '如何更新账户资料？', id: 3 }] }
    ],
    uploadUrlHost: uploadUrlHost
  },
  onLoad: function (options) {
    this.handleGetList()
  },
  onPullDownRefresh () {
    this.setData({ page: 1 })
    this.handleGetList()
  },
  onReachBottom () {
    if (this.data.dataSource.length >= this.data.total) return
    this.setData({ page: this.data.page + 1 })
    this.handleGetList()
  },
  handleGetList () {
    get('/article/help', null, {
      showLoading: true
    })
      .then(({ data }) => {
        this.setData({
          dataSource: data.list
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  handleChangeTab ({ detail }) {
    this.setData({ id: detail.id, page: 1 })
    this.handleGetList()
  },
  onCall () {
    wx.makePhoneCall({
      phoneNumber: '13339927553 ' // 仅为示例，并非真实的电话号码
    })
  },
  handleContact (e) {
  }
})
