import { get, post } from '../../utils/index'
import { uploadUrlHost } from '../../utils/constants'

const app = getApp()

Page({
  data: {
    userInfo: {},
    page: 1,
    dataSource: [],
    total: 0,
    defaultData: {
      title: '减免券', // 导航栏标题
    },
    id: '',
    uploadUrlHost: uploadUrlHost,
    mInfo: { img_url: 'https://image.jkcspace.com/wxmini_static/images/jian-bg.png' },
    tabs: [{ key: 1, value: '待使用' }, { key: 2, value: '已使用' }],
    activeTab: 1 //1:待使用，2：已使用
  },
  onLoad (options) {
    this.handleGetUserInfo()
    this.handleGetList()
    get('/member/info').then(({ data }) => (
      this.setData({ id: data.id })
    ))
  },
  onPullDownRefresh  () {
    this.handleGetUserInfo()
    this.handleGetList()
  },
  onReachBottom () {
  },
  handleGetUserInfo () {
    get('/discount_ticket/participate_info')
      .then(({ data }) => {
        this.setData({ mInfo: data })
      })
  },
  handleGetList () {
    get('/discount_ticket/list', {
      type: this.data.activeTab
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
  handleChangeData ({ currentTarget }) {
    const { activeTab } = this.data
    const key = currentTarget.dataset.key
    if (activeTab === key) return

    this.setData({ 
      activeTab: key,
    })
    this.handleGetList()
  },
  onShareAppMessage () {
    post('/behavior_record/share', { type: 2 })
      .then(res => {
      })
    return {
      title: 'CC编程，课程好 按月付，家长孩子两不误',
      path: `/pages/ground/index?id=${this.data.id}&type=1`
    }
  }
})
