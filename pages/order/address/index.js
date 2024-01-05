import { get, post } from '../../../utils/index'

const app = getApp ()

Page ({
  data: {
    page: 1,
    dataSource: {},
    defaultData: {
      title: '地址信息' // 导航栏标题
    },
    statusObj: { 1: '待发货', 2: '待完成', 3: '已完成', 4: '售后中', 5: '已关闭' },
    formData: {},
    rules: [{
      name: 'radio',
      rules: { required: false, message: '单选列表是必选项' },
    }, {
      name: 'checkbox',
      rules: { required: true, message: '多选列表是必选项' },
    }, {
      name: 'name',
      rules: { required: true, message: '请输入姓名' }
    }, {
      name: 'mobile',
      rules: [{ required: true, message: 'mobile必填' }, { mobile: true, message: 'mobile格式不对' }],
    }, {
      name: 'idcard',
      rules: {
        validator(rule, value) {
          if (!value || value.length !== 18) {
            return 'idcard格式不正确'
          }
          return ''
        }
      }
    }],
    area: [],
    areaName: [],
    isEdit: false,
    id: null
  },
  onLoad (options) {
    this.getDetails()
  },
  formInputChange ({ currentTarget, detail }) {
    const field = currentTarget.dataset && currentTarget.dataset.field
    if (field) {
      switch (field) {
        case 'consignee':
          this.setData({ consignee: detail.value })
          break
        case 'mobile':
          this.setData({ mobile: detail.value })
          break
        default:
          this.setData({ address: detail.value })
      }
    }
  },
  // 同意协议
  bindAgreeChange(e) {
    this.setData({
      isAgree: !!e.detail.value.length
    })
  },
  submitForm () {
    this.selectComponent('#form').validate((valid, errors) => {
      if (!valid) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          })
        }
      } else {
        wx.showToast({
          title: '校验通过'
        })
      }
    })
  },
  onAddAddress () {
    const { mobile, consignee, area, address, isEdit } = this.data
    if (isEdit) {
      this.onEditAddress()
      return
    }
    const params = {
      mobile,
      consignee,
      province_id: area[0],
      city_id: area[1],
      district_id: area[2],
      address
    }
    post('/address/add', params)
      .then(({ data }) => {
        this.onSetAddress(params)
      })
  },
  onEditAddress () {
    const { mobile, consignee, area, address, id } = this.data
    const params = {
      id,
      mobile,
      consignee,
      province_id: area[0],
      city_id: area[1],
      district_id: area[2],
      address
    }
    post('/address/edit', params)
      .then(({ data }) => {
        this.onSetAddress(params)
      })
  },
  onSetAddress (params) {
    const areaName = this.data.areaName
    app.globalData.addressData = {
      ...app.globalData.addressData,
      province_name: areaName[0],
      city_name: areaName[1],
      district_name: areaName[2],
      ...params
    }
    this.onReturn()
  },
  getDetails () {
    get('/address/detail')
      .then(({ data }) => {
        if (!data || !data.province_id) return
        const { mobile, consignee, id, province_id, city_id, district_id, province_name, district_name, city_name, address } = data

        this.setData({
          isEdit: true,
          id,
          mobile,
          consignee,
          areaName: [province_name, city_name, district_name],
          area: [province_id, city_id, district_id],
          address
        })
      })
  },
  onPullDownRefresh () {
    this.setData({ page: 1 })
  },
  onReachBottom() {
    if (this.data.dataSource.length >= this.data.total) return
    this.setData({ page: this.data.page + 1 })
  },
  handleChangeTab({ detail }) {
    this.setData({ receive_status: detail.index, page: 1 })
  },
  onCopy () {
    wx.setClipboardData({ data: this.data.dataSource.package.express_number })
  },
  onCopyOrder () {
    wx.setClipboardData({ data: this.data.dataSource.order_no })
  },
  handleOk ({ detail }) {
    this.setData({ area: detail.value, areaName: detail.name })
  },
  handleCancel () {

  },
  onReturn () {
    const pages = getCurrentPages() // 当前页面
    const beforePage = pages[pages.length - 2] // 前一页
    beforePage.getAddrDetails()
    wx.navigateBack({
      delta: 1
    })
  }
})
