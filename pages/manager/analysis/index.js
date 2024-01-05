import dayjs from "dayjs";
import { get, post, getOption, getNeedNum } from '../../../utils/index'
import { uploadUrlHost, defaultAvatar } from '../../../utils/constants'
import * as echarts from '../../../ec-canvas/echarts.min'

const app = getApp ()

Page ({
  data: {
    page: 1,
    dataSource: {},
    total: 0,
    defaultData: {
      title: '经营分析',
      hideShare: true
    },
    totalData: {},
    uploadUrlHost: uploadUrlHost,
    date: dayjs().format('YYYY-MM'),
    fdate: dayjs().format('YYYY.MM')
  },
  onLoad () {
    console.log('>>date', this.data.date)
    //获取到组件
    this.lazyComponent = this.selectComponent('#mychart-dom-pie')
    this.lazyComponent1 = this.selectComponent('#mychart-dom-pie1')
    setTimeout(() => {
      this.init([])
      this.init1([])
      this.handleGetList()
    }, 1100)
  },
  init(optionData) { //手动初始化
    this.lazyComponent.init((canvas, width, height, dpr) => {
      let chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRation: dpr
      })
      let option = getOption(optionData, {}, true)  // echarts的配置信息
      chart.setOption(option)
      this.chart = chart //将图表实例绑定到this上，方便其他函数访问
      return chart
    })
  },
  init1(optionData) { //手动初始化
    this.lazyComponent1.init((canvas, width, height, dpr) => {
      let chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRation: dpr
      })
      let option = getOption(optionData, {}, true)  // echarts的配置信息
      chart.setOption(option)
      this.chart1 = chart //将图表实例绑定到this上，方便其他函数访问
      return chart
    })
  },
  onPullDownRefresh () {
    this.setData({ date: dayjs().format('YYYY-MM'), fdate: dayjs().format('YYYY.MM') })
    this.handleGetList()
  },
  bindPickerChange ({ detail }) {
    this.setData({ date: detail.value, fdate: dayjs(detail.value).format('YYYY.MM') })
    this.handleGetList()
  },
  handleGetList () {
    const { date } = this.data
    get('/store_manager/store_business_analysis', {
      month: date
    }, {
      showLoading: true
    }).then(({ data }) => {
      this.setData({
        dataSource: data
      })
      const needData = [{ value: getNeedNum(data.revenue_target_amount), name: '经营目标金额' }]
      const needData1 = [{ value: getNeedNum(data.course_revenue_target_amount), name: '课程经营目标金额' }]
      if (data.revenue_completion_rate != 100) {
        needData.unshift({ value: getNeedNum(data.revenue_amount), name: '经营金额' })
      }
      if (data.course_offline_revenue_completion_rate != 100) {
        needData1.unshift({ value: getNeedNum(data.course_offline_amount), name: '课程经营金额' })
      }
      // rate 100% 就展示目标的进度
      const option = getOption(needData, { rate: data.revenue_completion_rate, value1: data.revenue_amount, value2: data.revenue_target_amount}, true)
      const option1 = getOption(needData1, { rate: data.course_offline_revenue_completion_rate, value1: data.course_offline_amount, value2: data.course_revenue_target_amount}, true)
      this.chart.setOption(option)
      this.chart1.setOption(option1)
    }).finally(() => {
      wx.stopPullDownRefresh()
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
  }
})
