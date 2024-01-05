import { get, post, upload } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'
import dayjs from 'dayjs'

const app = getApp()

Page ({
  data: {
    defaultData: {
      title: '课程详情',
      hideShare: true, //隐藏分享按钮
    },
    background: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 3000,
    duration: 500,
    uploadUrlHost: uploadUrlHost,
    imgs: [],
    isPlay: false,
    show: false,
    curDetails: {},
    showConfirm: false,
    confirmData: {
      title: '请确认信息后再提交',
      cancelText: '取消',
      okText: '确定'
    },
  },
  onLoad (options) {
    const { id } = options
    this.setData({ id })
    this.getDetails()
  },
  getDetails () {
    get('/teacher_identity/course_detail', { id: this.data.id }, {
      showLoading: true
    })
      .then(({ data = {} }) => {
        this.setData({
          details: {
            ...data,
            class_time: this.handleTime(data.class_time)
          },
          imgs: data.imgs
        })
      })
  },
  handleTime (t) {
    const arr = t.split(' ')
    return `${arr[0]} ${arr[1]}-${arr[2]}`
  },
  onDeleteImg ({ currentTarget }) {
    const { index } = currentTarget.dataset
    const _imgs = this.data.imgs
    this.setData({
      imgs: _imgs.filter((item, i) => i !== index)
    })
  },
  onShowConfirm () {
    this.setData({ showConfirm: true })
  },
  onAddImg () {
    post('/teacher_identity/add_classroom_situation', {
      id: this.data.id,
      imgs: this.data.imgs.map(item => item.img_url)
    }, { json: true })
      .then(({ data }) => {
        this.onReturn()
      }).catch(err => {
        this.setData({ showConfirm: false })
      })
  },
  onRollCall ({ currentTarget }) {
    const { id, status } = currentTarget.dataset

    post('/teacher_identity/roll_call', {
      course_offline_order: id,
      class_status: status == 1 ? 0 : 1
    })
      .then(({ data }) => {
        this.getDetails()
      })
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
  },
  ChooseImage () {
    const that = this
    wx.chooseImage({
      count: 9, // 默认3
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        for (let i = 0; i < tempFilePaths.length; i++) {
          const imgs = this.data.imgs

          upload({
            filePath: tempFilePaths[i] // 选取的视频资源临时地址
          }).then(({ data }) => {
            imgs.push({ img_url: data.key })
            that.setData({ imgs })
          })
        }
      }
    })
  },
  onReturn () {
    wx.navigateBack({
      delta: 1
    })
  },
  // 查看图片
  ViewImage(e) {
    const imgArr = this.data.fileList.filter((x)=>{return x.type =="img"}).map(x=>x.path)
    wx.previewImage({
      urls: imgArr,
      current: e.currentTarget.dataset.url
    });
  },
  // 删除图片
  DelImg (e) {
    let that = this
    wx.showModal({
      title: '提示',
      content: '是否删除照片',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm == 1) {
          that.data.fileList.splice(e.currentTarget.dataset.index, 1);
          that.setData({
            fileList: that.data.fileList
          })
        }
      },
    })
  },
  onPlay () {
    this.setData({ isPlay: true })
  },
  onShowModal ({ currentTarget }) {
    const curDetails = currentTarget.dataset.item
    this.setData({ show: true, curDetails: curDetails })
  },
  onCancel () {
    this.setData({ show: false, curDetails: {}, showConfirm: false })
  }
})
