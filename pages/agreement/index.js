import { get } from '../../utils/index'

Page({
  data: {
    content: '',
    defaultData: {
      title: '服务协议' // 导航栏标题
    }
  },
  onLoad (options) {
    this.handleGetList()
  },
  handleGetList () {
    get('/article/platform_agreement', null, {
      showLoading: true
    })
      .then(({ data }) => {
        this.setData({
          content: data.content
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onReturn () {
    wx.navigateBack({
      delta: 1
    })
  },
  onDisagree () {
    this.onReturn()
  },
  onAgree () {
    this.onReturn()
  }
})
