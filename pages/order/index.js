import dayjs from "dayjs";
import {get, post } from '../../utils/index'
import { uploadUrlHost } from '../../utils/constants'

const app = getApp()

Page ({
  data: {
    statusOptions: [{ key: 0, value: '全部' }, { key: 1, value: '待发货' }, { key: 2, value: '待完成' }, { key: 3, value: '已完成' }],
    kw: null,
    status: 0,
    page: 1,
    dataSource: [],
    total: 0,
    buttons: [
      { text: '取消' },
      { text: '确认' }
    ],
    defaultData: {
      title: '商城订单'
    },
    uploadUrlHost: uploadUrlHost,
    lineImg: 'order-bg-line.png',
    statusObj: { 1: '待发货', 2: '待完成', 3: '已完成', 4: '售后中', 5: '已关闭' }
  },
  onLoad (options) {
    this.handleGetList()
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
  handleGetList () {
    get('/ta_order/list', {
      type: this.data.status,
      page: this.data.page,
      pagesize: 20
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
  handleChangeTab ({ detail }) {
    this.setData({ status: detail.index, page: 1 })
    this.handleGetList()
  },
  handleSearch ({ detail }) {
    this.setData({ kw: detail.value, page: 1 })
    this.handleGetList()
  },
  // 全新创建 / edit 修改抽奖 / update 更新通知 / copy 复制抽奖
  handleToCreate ({ currentTarget }) {
    const { id = '', mode = '', ctime = null } = currentTarget.dataset
    // 群积分活动小程序创建的不允许复制
    if (mode === 'copy' && dayjs(ctime * 1000).isBefore(dayjs('2021-03-16 12:00:00'))) {
      return wx.showToast({ title: '抱歉，因版本更新，旧版本创建的活动无法复制。', icon: 'none'})
    }
    app.globalData.createData = null
    wx.navigateTo({ url: `/pages/create/base/index?id=${id}&mode=${mode}` })
  },
  // 推送至群
  handleSendToRoom ({ currentTarget }) {
    const { id, index, time } = currentTarget.dataset
    // 判断距离上次推送时间是否已经满足半小时
    if (time && (new Date() - new Date(time * 1000)) < 1800000) {
      const totalDiffSecond = 1800 - parseInt((new Date() - new Date(time * 1000)) / 1000)
      const m = parseInt(totalDiffSecond / 60)
      const s = totalDiffSecond % 60
      wx.showToast({ icon: 'none', title: `请勿频繁推送，距下次可推送还剩${m ? `${m}分` : ''}${s}秒` })
      return
    }
    wx.showModal({
      content: '是否确定将该活动一键推送至所选的全部群？'
    })
      .then(({ confirm }) => {
        if (confirm) {
          return post('/jifen/sendMiniApp2Room', { plan_id: id })
        } else {
          return Promise.reject('取消')
        }
      })
      .then(res => {
        wx.showToast({ icon: 'none', title: '推送成功' })
        // 记录本次推送时间
        this.setData({
          [`dataSource[${index}].last_push_time`]: parseInt(Date.now() / 1000),
        })
      })
  },
  // 删除抽奖
  handleDelete({ currentTarget }) {
    const id = currentTarget.dataset.id
    wx.showModal({
      content: '确认删除？'
    })
      .then(({ confirm }) => {
        if (confirm) {
          return post('/index/deleteLottery', { id }, { json: true })
        } else {
          return Promise.reject('取消')
        }
      })
      .then(res => {
        this.setData({ page: 1 })
        this.handleGetList()
      })
  },
  // 显示更多操作
  handleCallActionSheet({ currentTarget }) {
    const { id, index, time } = currentTarget.dataset
    wx.showActionSheet({
      itemList: ['推送至群', '删除抽奖']
    })
      .then(({ tapIndex }) => {
        if (tapIndex === 0) {
          this.handleSendToRoom({ currentTarget: { dataset: { id, index, time } } })
        } else {
          this.handleDelete({ currentTarget: { dataset: { id } } })
        }
      })
  }
})
