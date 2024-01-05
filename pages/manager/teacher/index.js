import dayjs from "dayjs";
import { get, post } from '../../../utils/index'
import { uploadUrlHost, defaultAvatar } from '../../../utils/constants'
const app = getApp ()

Page ({
  data: {
    page: 1,
    dataSource: [],
    total: 0,
    defaultData: {
      title: '老师管理', // 导航栏标题
      hideShare: true
    },
    uploadUrlHost: uploadUrlHost,
    date: dayjs().format('YYYY-MM'),
    fdate: dayjs().format('YYYY.MM'),
    show: false,
    setData: {
      title: '设定营收目标',
      placeholder: '请输入目标',
      number: null
    },
    curData: {},
    defaultAvatar: defaultAvatar,
    isCurMonth: true
  },
  onLoad (options) {
    this.getTotal()
  },
  onPullDownRefresh () {
    this.getTotal()
  },
  bindPickerChange (e) {
    this.setData({
      date: e.detail.value,
      fdate: dayjs(e.detail.value).format('YYYY.MM'),
      isCurMonth: e.detail.value == dayjs().format('YYYY-MM')
    })
    this.getTotal()
  },
  onShowModal ({ currentTarget }) {
    const { item } = currentTarget.dataset
    this.setData({ 
      show: true, 
      curData: {...item},
      setData: {
        ...this.data.setData,
        number: item.revenue_target_amount
      }
    })
  },
  onOk ({ detail }) {
    console.log('>>number', detail.number);
    const { curData } = this.data
    post('/store_manager/set_teacher_revenue', {
      amount: detail.number,
      id: curData.id
    })
      .then(({ data }) => {
        this.getTotal()
        this.onCancel()
      })
  },
  onCancel () {
    this.setData({ show: false, curData: {} })
  },
  getTotal () {
    const { date } = this.data
    get('/store_manager/store_teacher_manage', {
      month: date
    })
      .then(({ data }) => {
        this.setData({
          dataSource: data.list.map(item => ({
            ...item,
            rate: item.revenue_amount / item.revenue_target_amount * 100 > 100 ? 100 : item.revenue_amount / item.revenue_target_amount * 100 || 0
          }))
        })
      }).finally(() => {
        wx.stopPullDownRefresh()
      })
  }
})
