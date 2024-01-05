import dayjs from "dayjs";
import { get, post } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'

const app = getApp()

Page ({
  data: {
    details: {},
    status: 1,
    page: 1,
    dataSource: [],
    total: 0,
    buttons: [
      { text: '取消' },
      { text: '确认' }
    ],
    defaultData: {
      title: '课程信息'
    },
    isChoose: true,
    uploadUrlHost: uploadUrlHost,
    show: false,
    videoData: {}
  },
  onLoad (options) {
    const { id } = options
    id && this.setData({ id })
    this.handleGetList()
  },
  handleChangeTab ({ detail }) {
    this.setData({ status: detail.index, page: 1 })
    // this.handleGetList()
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
  },
  onReachBottom () {
    // if (this.data.dataSource.length >= this.data.total) return
    // this.setData({ page: this.data.page + 1 })
    // this.handleGetList()
  },
  handleGetList () {
    get('/online_course/collect_detail', {
      id: this.data.id
    }, {
      showLoading: true
    })
      .then(({ data }) => {
        this.setData({
          dataSource: data.child_course,
          details: data[0]
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onShowModal (e) {
    this.setData({
      show: true,
      videoData: {
        ...e.currentTarget.dataset.item
      }
    })
  },
  onCancel () {
    this.setData({ show: false })
  },
  onOk ({ detail }) {
    this.setData({ [detail.type]: detail.value, show: false })
    this.handleGetList()
  }
  // previewVideo (e) {
  //   console.log('????url', e.currentTarget.dataset.url)
  //   wx.previewMedia({
  //     sources: [{
  //       url: e.currentTarget.dataset.url,
  //       type: 'video' // video视频 image图片
  //     }]
  //   })
  // }
})
