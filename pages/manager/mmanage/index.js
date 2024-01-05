import dayjs from "dayjs";
import { get, post, getOption, getNeedNum } from '../../../utils/index'
import { uploadUrlHost, defaultAvatar } from '../../../utils/constants'
import * as echarts from '../../../ec-canvas/echarts.min'

const app = getApp ()

Page ({
  data: {
    defaultData: {
      title: '会员管理',
      hideShare: true
    },
    totalData: {},
    uploadUrlHost: uploadUrlHost,
    mList: []
  },
  onLoad (options) {
    this.getList()
      //获取到组件
    this.lazyComponent = this.selectComponent('#mychart-dom-pie')
    setTimeout(() => {
      this.init([])
      this.getTotal()
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
  onPullDownRefresh () {
    this.getTotal()
    this.getList()
  },
  getTotal () {
    get('/store_manager/store_member_manage')
      .then(({ data }) => {
        this.setData({
          totalData: data
        })
        const option = getOption([
          { value: getNeedNum(data.member_theme_type_rate1), name: '常规班' },
          { value: getNeedNum(data.member_theme_type_rate2), name: '精品小班' },
          { value: getNeedNum(data.member_theme_type_rate3), name: '代码编程' },
          { value: getNeedNum(data.member_theme_type_rate4), name: '未确定' }
        ], { value1: data.member_count })
        this.chart.setOption(option)
      }).finally(() => {
        wx.stopPullDownRefresh()
      })  
  },
  getList () {
    get('/store_manager/store_member_list')
      .then(({ data }) => {
        this.setData({
          mList: data.list.slice(0, 3)
        })
      }).finally(() => {
        wx.stopPullDownRefresh()
      })
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
  }
})
