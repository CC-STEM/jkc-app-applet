import { get, post } from '../../../utils/index'
import WxParse from '../../wxParse/wxParse.js'

const app = getApp()

Page({
  data: {
    name: '',
    article: '',
    defaultData: {
      title: '详情' // 导航栏标题
    }
  },
  onLoad (options) {
    const { id } = options
    this.setData({ id })
    this.handleGetList(id)
  },
  onPullDownRefresh () {
    this.handleGetList()
  },
  handleGetList () {
    get('/market/detail', {
      id: this.data.id
    }, {
      showLoading: true
    })
      .then(({ data }) => {
        this.setData({
          name: data.name,
          article: data.describe
        })
        const article = data.describe
        WxParse.wxParse('article', 'html', article, this, 5)
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  }
})
