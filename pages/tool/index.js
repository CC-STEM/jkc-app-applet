import dayjs from "dayjs";
import { get, post } from '../../utils/index'
import { uploadUrlHost } from '../../utils/constants'

const app = getApp()

Page ({
  data: {
    page: 1,
    dataSource: [],
    total: 0,
    defaultData: {
      title: '教具商城' // 导航栏标题
    },
    uploadUrlHost: uploadUrlHost,
    showCate: false,
    showPrice: false,
    category: null,
    suitAge: null,
    price: null,
    showQrcodeBtn: null
  },
  onLoad (options) {
    this.handleGetList()
    options.showQrcodeBtn == 1 && this.setData({ showQrcodeBtn: options.showQrcodeBtn })
  },
  onPullDownRefresh () {
    this.setData({ page: 1, category: null, suitAge: null, price: null, showPrice: false, showCate: false })
    this.handleGetList()
  },
  onReachBottom () {
    if (this.data.dataSource.length >= this.data.total) return
    this.setData({ page: this.data.page + 1 })
    this.handleGetList()
  },
  handleGetList () {
    const { category, suitAge, price } = this.data
    const params = {
      page: this.data.page,
      page_size: 20
    }
    if (category) {
      params.category = category
    }
    if (suitAge) {
      params.suit_age = suitAge
    }
    if (price) {
      params.price = price
    }
    get('/ta_goods/list', params, {
      showLoading: true
    })
      .then(({ data }) => {
        const newDataSource = this.data.page === 1 ? data.list : this.data.dataSource.concat(data.list)
        this.setData({
          dataSource: newDataSource,
          total: data.page.count
        })
        if (this.data.page === 1) {
          wx.pageScrollTo({ scrollTop: 0 })
        }
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  mCancel () {
    this.hideModal()
  },
  onSubmit () {
    this.hideModal()
    post('/ta_order/add_refund_package', {
      // order_goods_id: this.data.curVal,
      // logis_name: 
      // express_number:
    })
      .then(res => {
        this.setData({
          hideCategrayFlag: false
        })
      })
  },
  onShowModal () {
    this.setData({ showCate: true })
  },
  onShowPrice () {
    this.setData({ showPrice: true })
  },
  onCancel () {
    this.setData({ showCate: false, showPrice: false })
  },
  onOk ({ detail }) {
    this.setData({ [detail.type]: detail.value, showPrice: false, showCate: false })
    this.handleGetList()
  }
})
