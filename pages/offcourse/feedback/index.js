import dayjs from 'dayjs'
import { get } from '../../../utils/index'
import { uploadUrlHost, typeObj } from '../../../utils/constants'

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateString: '',
    typeList: [{ url: '/pages/offcourse/planInfo', title: '课程知识', num: 1 }, { url: '/pages/invite/index', title: '上课照片', num: 5 }],
    page: 1,
    dataSource: [],
    typeObj: typeObj,
    defaultData: {
      title: '课程反馈',
      activeTab: 1
    },
    uploadUrlHost: uploadUrlHost
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow (options) {
    this.handleGetList()
  },
  handleGetList () {
    get('/offline_course_order/course_feedback_list')
      .then(({ data }) => {
        this.setData({
          dataSource: data.list.map(item => ({
            date: `${dayjs(item.start_at).format('YYYY.MM.DD')}`,
            time: `${dayjs(item.start_at).format('HH:mm')}~${dayjs(item.end_at).format('HH:mm')}`,
            ...item
          }))
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
  },
  onReachBottom () {
    this.handleGetList()
  },
  // 查看图片
  onViewImage ({ currentTarget }) {
    const { url = [] } = currentTarget.dataset
    const _url = url.map(item => `${uploadUrlHost}/${item}`)
    wx.previewImage({
      urls: _url,
      current: _url
    })
  }
})
