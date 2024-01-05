import dayjs from "dayjs";
import { get, post } from '../../utils/index'
import { uploadUrlHost, defaultAvatar } from '../../utils/constants'

const app = getApp ()

Page ({
  data: {
    page: 1,
    dataSource: [],
    total: 0,
    defaultData: {
      hideShare: true, //隐藏分享按钮
      showTab: true,
      activeTab: 0,
      noLectureCount: 0,
      lecturedCount: 0,
      teacher_name: '',
      teacher_avator: ''
    },
    totalData: {},
    uploadUrlHost: uploadUrlHost,
    show: true,
    confirmData: {},
    typeMap: [
      { name: '常规班', value: 1, type: 1 },
      { name: '精品班', value: 1, type: 2 },
      { name: '代码编程', value: 1, type: 3 },
      { name: '商品', value: 1, type: 4 },
      { name: '会员卡', value: 1, type: 5 },
      { name: '特殊奖励', value: '...', type: 6 },
    ],
    typeMap2: [
      { name: '常规班', value: 1, type: 1 },
      { name: '精品班', value: 1, type: 2 },
      { name: '代码编程', value: 1, type: 3 },
    ],
    touchDot: 0, //触摸时的原点
    time: 0, // 时间记录，用于滑动时且时间小于1s则执行左右滑动
    interval: '',// 记录/清理 时间记录
    isUp: false,// 判断不再执行滑动事件
    salaryTotal: {},
    showTotal: true
  },
  onLoad (options) {
    this.handleGetList()
    this.getTotal()
    this.handleSalary()
  },
  onPullDownRefresh () {
    this.setData({ page: 1 })
    this.handleGetList()
    this.handleSalary()
  },
  onReachBottom () {
    if (this.data.dataSource.length >= this.data.total) return
    this.setData({ page: this.data.page + 1 })
    this.handleGetList()
  },
  onShowTotal () {
    this.setData({ showTotal: !this.data.showTotal })
  },
  onChange () {
    wx.reLaunch({ url: '/pages/my/index' })
  },
  getTotal () {
    get('/teacher_identity/course_statistics')
      .then(({ data }) => {
        if (!data.week_data) return
        this.setData({
          totalData: data.week_data && data.week_data.length
            ? [
                data.week_data.map(item => item.lectured_count),
                data.week_data.map(item => item.student_count),
                data.week_data.map(item => item.date_text)
              ]
            : [],
          defaultData: {
            ...this.data.defaultData,
            noLectureCount: data.no_lecture_count || 0,
            lecturedCount: data.lectured_count || 0,
            teacher_name: data.teacher_name,
            teacher_avatar: data.avatar ? `${ uploadUrlHost }/${data.avatar}` : defaultAvatar
          }
        })
      })
  },
  handleGetList () {
    get('/teacher_identity/course_list', {
      type: this.data.defaultData.activeTab,
      page: this.data.page,
      page_size: 20
    }, {
      showLoading: true
    }).then(({ data }) => {
      const newDataSource = this.data.page === 1 ? data.list : this.data.dataSource.concat(data.list)
      this.setData({
        dataSource: newDataSource,
        total: data.page.count
      })
      if (this.data.page === 1) {
        wx.pageScrollTo({ scrollTop: 0 })
      }
    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  handleSalary () {
    const { typeMap, typeMap2 } = this.data
    get('/teacher_identity/salary_statistics', { }, {
    }).then(({ data }) => {
      this.setData({
        salaryTotal: { ...data },
        typeMap: [
          { ...typeMap[0], value: data.commission1 },
          { ...typeMap[1], value: data.commission2 },
          { ...typeMap[2], value: data.commission3 },
          { ...typeMap[3], value: data.commission4 },
          { ...typeMap[4], value: data.commission5 },
          { ...typeMap[5], value: data.commission6 },
        ],
        typeMap2: [
          { ...typeMap2[0], value1: data.course_offline_theme1_count1, value2: data.course_offline_theme1_count2 },
          { ...typeMap2[1], value1: data.course_offline_theme2_count1, value2: data.course_offline_theme2_count2 },
          { ...typeMap2[2], value1: data.course_offline_theme3_count1, value2: data.course_offline_theme3_count2 },
        ]
      })
    })
  },
  onChangeTab ({ detail }) {
    const { defaultData } = this.data
    this.setData({
      isUp: false,
      page: 1,
      defaultData: {
        ...defaultData,
        activeTab: detail.index,
      }
    })
    this.handleGetList()
  },
  onOk () {
  },
  onCancel() {
    this.setData({
      show: false
    })
  },
  onShowMore () {
    this.setData({ isUp: !this.data.isUp })
  },
  // 触摸开始事件
  touchStart (e) { 
    const { time } = this.data
    // 使用js计时器记录时间  
    this.setData({
      touchDot: e.touches[0].pageY, // 获取触摸时的原点
      interval: setInterval(() => {
        this.setData({ time: time + 1 })
      }, 100)
    })
  },
  // 触摸移动事件
  touchMove (e) { 
    let { touchDot, time, isUp } = this.data
    let touchMove = e.touches[0].pageY;
    // 向下滑动  
    if (touchMove - touchDot <= -30 && time < 10) { 
      !isUp && this.setData({ isUp: true })
    }
    // 向上滑动
    if (touchMove - touchDot >= 30 && time < 10) {
      isUp && this.setData({ isUp: false })
    }
    // touchDot = touchMove; //每移动一次把上一次的点作为原点（好像没啥用）
  },
  // 触摸结束事件
  touchEnd (e) {
    const { interval } = this.data
    // 清除setInterval
    if (interval) {
      this.setData({
        interval: clearInterval(interval)
      })
    }
    this.setData({
      time: 0,
      tmpFlag: true
    })
  },
})
