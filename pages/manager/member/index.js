import dayjs from 'dayjs'
import { get, post } from '../../../utils/index'
import { uploadUrlHost, memberTypeObj, defaultAvatar } from '../../../utils/constants'

const app = getApp()

Page({
  data: {
    dataSource: [],
    defaultData: {
      title: '会员列表', // 导航栏标题
      hideShare: true
    },
    uploadUrlHost: uploadUrlHost,
    show: false,
    stores: [],
    memberTypeObj: memberTypeObj,
    physicalStore: {},
    number: null,
    filter: {
      type1: '',
      type2: ''
    },
    defaultAvatar: defaultAvatar
  },
  onLoad (options) {
    this.handleGetList()
  },
  onPullDownRefresh () {
    this.setData({
      number: null,
      filter: {
        type1: '',
        type2: ''
      }
    })
    this.handleGetList()
  },
  onShowModal ({ currentTarget }) {
    this.setData({ show: true })
  },
  formInputChange ({ currentTarget, detail }) {
    const field = currentTarget.dataset && currentTarget.dataset.field
    this.setData({ number: detail.value })
    this.handleGetList()
  },
  onOk ({ detail }) {
    this.setData({
      filter: {
        type1: detail.type1,
        type2: detail.type2
      }
    })
    this.handleGetList()
  },
  onCancel () {
    this.setData({ show: false })
  },
  handleGetList () {
    const { number, filter } = this.data
    get('/store_manager/store_member_list', {
      keywords: number,
      member_status_type: filter.type2,
      teacher_id: filter.type1
    })
      .then(({ data }) => {
        this.setData({
          dataSource: data.list
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  }
})
