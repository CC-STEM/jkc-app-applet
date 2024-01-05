import dayjs from "dayjs";
import { get, post } from '../../utils/index'
import { uploadUrlHost } from '../../utils/constants'

const app = getApp()

Page ({
  data: {
    kw: null,
    status: 1,
    page: 1,
    total: 1,
    defaultData: {
      title: '课程信息'
    },
    id: '',
    details: {},
    uploadUrlHost: uploadUrlHost,
    src: 'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400',
    scrollindex: 0,
    totalnum: 4,
    starty: 0,
    startTime: 0,
    endy: 0,
    endTime: 0,
    critical: 80,
    maxTimeCritical: 300,
    minTimeCritical: 100,
    margintop: 0,
    currentTarget: null,
    course_online_child_id: null 
  },
  onLoad (options) {
    this.setData({ id: options.id, course_online_child_id: options.course_online_child_id })
    this.getDetails()
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
  },
  // onReachBottom () {
  //   if (this.data.dataSource.length >= this.data.total) return
  //   this.setData({ page: this.data.page + 1 })
  //   this.handleGetList()
  // },
  onReturn () {
    wx.navigateBack({
      delta: 1
    })
  },
  getDetails () {
    get('/online_course/child_detail', {
      id: this.data.id
    }, {
      showLoading: true
    })
      .then(({ data }) => {
        this.setData({ details: data })
      })
  },
  onAdd () {
    wx.switchTab({
      url: '/pages/offcourse/index'
    })
    // post('/online_course/add_collect', {
    //   id: this.data.details.course_online_id
    // })
    //   .then(({ data }) => {
    //     wx.showToast({ title: '添加成功', icon: 'none' })
    //     this.onReturn()
    //   })
  },
  getMoreData () {
    get('/ta_goods/reach_course_list', {
      course_online_child_id: this.data.course_online_child_id,
      page: this.data.page,
      page_size: 1
    }, {
      showLoading: true
    })
      .then(({ data }) => {
        this.setData({
          details: data.list[0],
          total: data.page.count
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  scrollTouchStart (e) { // 详情进来才能切换
    const { endy, course_online_child_id, page, total } = this.data

    const starty = e.touches[0].pageY
    const startTime = e.timeStamp
    // currentTarget = e.currentTarget.id
    this.setData({
      starty,
      startTime
      // currentTarget: currentTarget
    })
  },
  scrollTouchMove (e) {
  },
  scrollTouchEnd (e) { // 详情进来才能切换
    const { starty, course_online_child_id, page, total } = this.data
    if (!course_online_child_id) return

    const endy = e.changedTouches[0].pageY
    const endTime = e.timeStamp
    // const timeStampdiffer = stamp - d.startTime
    this.setData({
      endy,
      endTime
    })

    if ((starty - endy) > 50) { // 下一页
      if (page > 1 && page >= total) return
      this.setData({ page: page + 1 })
      this.getMoreData()
    }
    if ((endy - starty) > 50) { // 上一页
      if (page < 2) return
      this.setData({ page: page - 1 })
      this.getMoreData()
    }
  }
})
