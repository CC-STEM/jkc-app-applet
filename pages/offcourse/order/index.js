import dayjs from "dayjs";
import { get, post } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'

const app = getApp()

function getNeedDate (str) {
  return dayjs(str).format('MM月DD日')
}

function getNeedTime (str) {
  return dayjs(str).format('HH:mm')
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateString: "",
    spot: ['2022/5/6', '2022/5/9', '2022/5/20', '2022/5/12', '2022/6/1'],
    status: 1,
    page: 1,
    dataSource: [],
    total: 0,
    defaultData: {
      title: '约课信息确认',
      noBgColor: true,
      type: 3
    },
    batchNos: '',
    themeType: 1,
    uploadUrlHost: uploadUrlHost,
    showConfirm: false,
    confirmData: {
      title: '约课成功',
      content: '您已成功约课，可通过课程表“线下课程” 查看上课具体信息',
      cancelText: '留在本页',
      okText: '前往查看'
    },
    isSample: 0,
    tmplIds: ['yQuCJzK-s5G-ZSej89_UX9T-8uhocbe4D96rjWz8InI', 'TN6OIDBUP3GuvbXaGcYClMybGaTMt9ZEEUvXJOM6ELA', 'hlrFdNtI8nfO9EO5qkrT3kxrJBb0hyJXbzaYZv4iYGE'],
    orderNo: ''
  },
  dateChange (e) {
    this.setData({
      dateString: e.detail.dateString
    })
  },
  onLoad (options) {
    const { batchNos, ids, type, isSample, themeType } = options
    if (ids) {
      this.setData({ ids: JSON.parse(ids) })
    }
    if (batchNos) {
      this.setData({ batchNos: JSON.parse(batchNos) })
    }
    if (isSample) {
      this.setData({ isSample: isSample })
    }
    if (themeType) {
      this.setData({ themeType: themeType })
    }
    this.setData({ type })
    this.handleGetList()
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
  },
  handleGetList () {
    const { batchNos, ids, type, isSample, themeType } = this.data
    const params = {
      course_type: type,
      // theme_type: themeType
    }
    if (isSample) { //是否是体验课：0 否，1 是
      params.is_sample = isSample
    }
    // params.batch_no = batchNos
    params.course_offline_plan = ids
    post('/offline_course_order/confirm', params, { json: true })
      .then(({ data }) => {
        const dataSource = data || {}
        dataSource.course = dataSource.course.map(item => ({
          ...item,
          time: getNeedTime(item.class_start_time),
          date: getNeedDate(item.class_start_time)
        }))
        this.setData({
          dataSource: data
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onSubmit () {
    const { batchNos, ids, type, isSample, themeType } = this.data
    const params = {
      course_type: type,
      // theme_type: themeType
    }
    if (isSample) {
      params.is_sample = isSample
    }
    // params.batch_no = batchNos
    params.course_offline_plan = ids
    post('/offline_course_order/submit', params, { json: true })
      .then(({ data }) => {
        this.setData({ showConfirm: true, orderNo: data.order_no })
        this.onGetXiaoXi()
      })
  },

  onGetXiaoXi () {
    const { tmplIds } = this.data
    //  订阅消息
    wx.requestSubscribeMessage({
      tmplIds: [...tmplIds],
      success: (res) => {
        console.log('>success', res, tmplIds[0], res[tmplIds[0]])
        const arr = []
        tmplIds.forEach(id => {
          if (res[id] == 'accept') {
            arr.push(id)
          }
        })
        this.onGetSubscribe(arr)
      },
      fail (e) {
        console.log('>fail', e)
        this.onGetSubscribe([])
      }
    })
  },
  onGetSubscribe (arr) {
    const { orderNo } = this.data
    post('/wx_message/mp_subscribe', {
      template_id: arr,
      request_name: 'COURSE_OFFLINE_BUY',
      subscribe_id: orderNo
    }).then(() => {
      
    })
  },
  onOk () {
    this.onCancel()
    wx.navigateTo({
      url: '/pages/offcourse/list/index'
    })
  },
  onCancel () {
    this.setData({ showConfirm: false })
  }
})
