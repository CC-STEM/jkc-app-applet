import { get, post, upload } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'

const app = getApp ()

Page ({
  data: {
    userInfo: {},
    receive_status: 0,
    page: 1,
    dataSource: [],
    total: 0,
    reason: '',
    reasonName: '',
    reasonList: [],
    remark: '',
    defaultData: {
      title: '申请退款' // 导航栏标题
    },
    imgArr: [],
    uploadUrlHost: uploadUrlHost,
    showConfirm: false,
    confirmData: {
      title: '申请提交成功',
      content: '已收到您的申请，我们将会尽快处理您的申请， 后续可通过短信货订单详情查看',
      // hideCancel: true,
      cancelText: '',
      okText: '我知道了'
    }
  },
  onLoad (options) {
    this.setData({ id: options.id, order_goods_id: options.order_goods_id })
    this.getDetail()
    this.getReason()
  },
  getDetail () {
    get('/ta_order/detail', {
      id: this.data.id
    })
      .then(({ data, pager}) => {
        this.setData({
          dataSource: data
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  getReason () {
    get('/ta_order/refund_reason')
      .then(({ data }) => {
        this.setData({
          reasonList: data.list
        })
      })
  },
  onPullDownRefresh () {
    this.setData({ page: 1 })
    this.handleGetList()
  },
  onRefund () {
    const { id, remark, reasonName, imgArr } = this.data
    if (!reasonName) {
      wx.showToast({
        title: '请选择申请原因',
        icon: 'none'
      })
      return
    }
    post('/ta_order/refund_apply', {
      order_goods_id: id,
      reason: reasonName,
      memo: remark,
      img_url: imgArr
    }, {}, { json: true })
      .then(({ data }) => {
        this.onOk()
        // this.setData({ showConfirm: true })
        this.setData({ userInfo: data })
      })
  },
  handleChangeData ({ currentTarget, detail }) {
    const field = currentTarget.dataset && currentTarget.dataset.field
    if (field) {
      switch (field) {
        case 'reason':
          this.setData({ reason: detail.value, reasonName: this.data.reasonList[detail.value].name })
          break
        default:
          this.setData({ [field]: detail.value }) // express_number
      }
    }
  },
  // 上传图片
  ChooseImage (e) {
    const that = this
    wx.chooseImage({
      count: 9, // 默认3
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        for (let i = 0; i < tempFilePaths.length; i++) {
          const imgArr = this.data.imgArr

          upload({
            filePath: tempFilePaths[i] // 选取的视频资源临时地址
          }).then(({ data }) => {
            imgArr.push(data.key)
            that.setData({ imgArr })
          })
        }
      }
    })
  },

  // 查看图片
  ViewImage (e) {
    let that = this
    let imgArr = that.data.fileList.filter((x)=>{return x.type =="img"}).map(x=>x.path)
    wx.previewImage({
      urls: imgArr,
      current: e.currentTarget.dataset.url
    });
  },
  // 删除图片
  DelImg (e) {
    let that=this
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
  onShowConfirm () {
    this.setData({ showConfirm: true })
  },
  onOk () {
    this.onCancel()
    wx.redirectTo({ url: '/pages/order/index' })
  },
  onCancel () {
    this.setData({ showConfirm: false })
  }
})
