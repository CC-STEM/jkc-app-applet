import { uploadUrlHost } from '../../utils/constants'
import { get, post } from '../../utils/index'

const app = getApp ()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultData: {
      title: '学习计划',
      // noBgColor: true,
      // type: 1,
      isWhite: false,
      tabs: [{ key: 1, value: '幼儿版' }, { key: 2, value: '少儿版' }],
      showTab: true,
      activeTab: 0
    },
    imgUrl: ''
    // imgUrl: ''https://img0.baidu.com/it/u=2529320505,1328670466&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=500''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    // this.setData({ id: options.id })
    // this.getDetails()
    // wx.showLoading({
    //   title: '海报生成中',
    //   mask: true
    // })
  },
  getDetails () {
    get('/online_course/study_opus_share', {
      id: this.data.id
    })
      .then(({ data }) => {
        this.setData({
          avatar: data.avatar,
          imgUrl: `${uploadUrlHost}/${data.img_url}`,
          name: data.name,
          qrcode: `${uploadUrlHost}/${data.qc_code}`
        })
        this.initCanvas()
      })
  },
  handleChangeData ({ detail }) {
    const { defaultData } = this.data
    this.setData({ defaultData: { ...defaultData, activeTab: detail.index }, active: 0 })
  }
  // onReport () {
  //   // 1 精品小班，2 代码编程，3 主题科创班，4 学习计划
  //   post('/study_plan/enrollment', {
  //     type: 4
  //   })
  //     .then(({ data }) => {
  //       wx.showToast({
  //         title: '报名成功'
  //       })
  //     })
  // }
})
