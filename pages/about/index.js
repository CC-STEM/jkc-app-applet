import dayjs from "dayjs";
import {get, post } from '../../utils/index'

const app = getApp()

Page({
  data: {
    themeList: [],
    // themeList: [{ key: 0, value: '企业品牌' }, { key: 1, value: '企业优势' }, { key: 2, value: '企业服务' }, { key: 3, value: '企业服务' }, { key: 4, value: '企业服务' }, { key: 5, value: '企业服务' }, { key: 6, value: '企业服务' }, { key: 7, value: '企业服务' }],
    curIndex: 0,
    page: 1,
    dataSource: [],
    total: 0,
    defaultData: {
      title: '了解我们'
    }
  },
  onLoad (options) {
    this.handleGetThemeList()
  },
  onPullDownRefresh () {
    this.handleGetThemeList()
  },
  handleGetThemeList () {
    get('/article/about_us', null, {
      showLoading: true
    })
      .then(({ data }) => {
        if (!data.list || !data.list.length) return
        const themeList = data.list.map((item, index) => ({
          ...item,
          key: index,
          value: item.name
        }))
        this.setData({
          themeList,
          curIndex: 0
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  handleChangeTab ({ detail }) {
    this.setData({ curIndex: detail.index })
  }
})
