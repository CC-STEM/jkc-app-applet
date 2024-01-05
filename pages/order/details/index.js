import { get, post } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'

const app = getApp ()

Page ({
  data: {
    page: 1,
    dataSource: {},
    defaultData: {
      title: '订单详情', // 导航栏标题
      noBgColor: true,
      isDetails: true
    },
    statusObj: { 1: '待发货', 2: '待完成', 3: '已完成', 4: '售后中', 5: '已关闭' },
    show: false, // true-隐藏 false-显示
    showPackage: false,
    modalData: {
      active: 1, // 1 填写单号 2 寄件信息
      title: '寄件信息',
      name: '中通',
      number: '123',
      btnText: '我知道了'
    },
    uploadUrlHost: uploadUrlHost,
    showConfirm: false,
    confirmData: {
      title: '确定取消申请退款',
      content: '',
      cancelText: '取消',
      okText: '确定'
    }
  },
  onLoad (options) {
    this.setData({ id: options.id })
    this.getDetail()
  },
  getDetail () {
    get('/ta_order/detail', {
      id: this.data.id
    })
      .then(({ data }) => {
        this.setData({
          dataSource: data
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onPullDownRefresh () {
    this.setData({ page: 1 })
    this.getDetail()
  },
  onCopyNum () {
    wx.setClipboardData({ data: this.data.dataSource.package1[0].express_number })
  },
  onCopy () {
    wx.setClipboardData({
      data: `${this.data.dataSource.seller_address.consignee} ${this.data.dataSource.seller_address.mobile} ${this.data.dataSource.seller_address.province_name}${this.data.dataSource.seller_address.city_name}${this.data.dataSource.seller_address.district_name}${this.data.dataSource.seller_address.address}`
    })
  },
  onCopyOrder () {
    wx.setClipboardData({ data: this.data.dataSource.order_no })
  },
  onShowModal () {
    this.setData({ show: true })
  },
  onShowPackage () {
    this.setData({
      showPackage: true,
      modalData: this.data.dataSource.package2[0]
    })
  },
  onCancel () {
    this.setData({ show: false, showPackage: false, showConfirm: false })
  },
  onOk ({ detail }) {
    post('/ta_order/add_refund_package', {
      order_goods_id: this.data.dataSource.id,
      logis_name: detail.logis_name,
      express_number: detail.express_number
    })
      .then(res => {
        this.onCancel()
        this.getDetail()
      })
  },
  onShowConfirm () {
    this.setData({ showConfirm: true })
  },
  onCancelRefund () {
    post('/ta_order/cancel_refund_apply', {
      order_goods_id: this.data.dataSource.id
    })
      .then(res => {
        this.onCancel()
        this.getDetail()
      })
  }
})
