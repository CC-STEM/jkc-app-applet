import { uploadUrlHost } from '../../utils/constants'
import { post } from '../../utils/index'

// const app = getApp()

Component ({
  properties: {
    show: {
      type: Boolean,
      value: false
    }, // 这里定义了modalHidden属性，属性值可以在组件使用时指定.写法为modal-hidden
    // defaultData（父页面传递的数据-就是引用组件的页面）
    defaultData: {
      type: Object,
      value: {
        prop: [],
        sku: []
      }
    },
    addressData: {
      type: Object,
      value: {},
      observer (nv, ov, path) {
        this.setData({
          addressData: nv
        })
      }
    }
  },
  /**
  * 页面的初始数据
  */
  data: {
    dataSource: {},
    uploadUrlHost: uploadUrlHost,
    selectedArr: [],
    selectedStr: '',
    price: 0,
    cover: '',
    totalPrice: 0,
    number: 1,
    couponData: [],
    showCoupon: false,
    curCoupon: {},
    skuId: null
  },
  lifetimes: {
    attached () {
      const dataSource = this.data.defaultData
      const selectedArr = []
      dataSource.prop.forEach((item, i) => {
        selectedArr.push(item[0].prop_value)
        item[0] = {
          ...item[0],
          isActive: true
        }
      })
      const price = dataSource.sku[0].price
      const cover = dataSource.sku[0].img_url
      const skuId = dataSource.sku[0].id
      this.setData({ price, totalPrice: price, cover, selectedArr, dataSource, selectedStr: selectedArr.join(':'), skuId })
      // this.getDetails()
      this.getCoupon()
    }
  },
  methods: {
    onBuy () {
      const { vipList, active } = this.data
      post('/vip_card/buy', {
        id: vipList[active].id,
        recommend_code: this.data.number
      })
        .then(({ data }) => {
          wx.requestPayment({
            nonceStr: data.nonce_str,
            package: data.package,
            paySign: data.pay_sign,
            signType: data.sign_type,
            timeStamp: data.time_stamp,
            success: (res) => {
              this.setData({ showConfirm: true })
            },
            fail: (res) => {
              console.log(res, '>>>fail')
            }
          })
        })
    },
    onSelect ({ currentTarget }) {
      const { value = '', name = '' } = currentTarget.dataset
      const { selectedArr, dataSource, price, number, cover } = this.data
      let _price = price
      let _cover = cover
      let skuId = null
      let index = 0
      dataSource.prop.forEach((item, i) => {
        selectedArr[i] = selectedArr[i] || ''
        item.forEach(it => {
          if (it.prop_name === name) {
            index = i
            if (it.prop_value === value) {
              index = i
              it.isActive = true
            } else {
              it.isActive = false
            }
          }
        })
      })
      selectedArr[index] = value

      dataSource.sku.forEach((it, i) => {
        if (it.prop_value_str === selectedArr.join(':')) {
          _price = it.price
          _cover = it.img_url
          skuId = it.id
        }
      })

      this.setData({ dataSource, selectedArr, price: _price, cover: _cover, totalPrice: _price * number, selectedStr: selectedArr.join(':'), skuId: skuId })
      this.getCoupon()
    },
    onSubmit () {
      const { dataSource, selectedArr, skuId, number, curCoupon = {} } = this.data
      // let id = null
      // dataSource.sku.forEach((it, i) => {
      //   if (it.prop_value_str === selectedArr.join(':')) {
      //     id = it.id
      //   }
      // })

      this.triggerEvent('ok', {
        quantity: number,
        sku_id: skuId,
        coupon_id: curCoupon.id ? curCoupon.id : ''
      })
    },
    handleChangeData ({ currentTarget, detail }) {
      const field = currentTarget.dataset && currentTarget.dataset.field
      if (field) {
        switch (field) {
          case 'logis_name':
            this.setData({ logis_name: detail.value })
            break
          default:
            this.setData({ [field]: detail.value }) // express_number
        }
      }
    },
    onReduce () {
      const { number, price } = this.data
      if (number <= 1) {
        return
      }
      this.setData({ number: number - 1, totalPrice: Number(price) * (number - 1) })
      this.getCoupon()
    },
    onPlus () {
      const { number, price } = this.data
      // if (number <= 0) {
      //   return
      // }
      this.setData({ number: number + 1, totalPrice: Number(price) * (number + 1) })
      this.getCoupon()
    },
    getCoupon () {
      const { skuId, curCoupon = {}, number } = this.data
      console.log('>>this.data', this.data)
      const params = {
        quantity: number,
        sku_id: skuId,
      }
      if (curCoupon.id) {
        params.coupon_id = curCoupon.id
      }
      post('/ta_order/confirm', params)
        .then(({ data }) => {
          this.setData({
            allData: data,
            totalPrice: data.amount,
            couponData: data.coupon_list,
            curCoupon: data.selected_coupon || {},
          })
        })
    },
    onCopy () {
      wx.setClipboardData({ data: this.data.dataSource.package.express_number })
    },
    onShowCoupon() {
      this.setData({ showCoupon: true })
    },
    onSelectCoupon({ detail }) {
      this.setData({ curCoupon: detail.coupon })
      this.setData({
        isUsed: detail.coupon.id
      })
      this.getCoupon()
      this.onCancel()
    },
    // 取消
    onCancel () {
      this.setData({ showCoupon: false })
    },
    // 取消
    mCancel () {
      this.hideModal()
    },
    // 隐藏遮罩层
    hideModal () {
      this.triggerEvent('cancel', false)
      const that = this
      const animation = wx.createAnimation({
        duration: 400, // 动画的持续时间 默认400ms
        timingFunction: 'ease' // 动画的效果 默认值是linear
      })
      this.animation = animation
      that.slideDown() // 调用动画--滑出
      let time1 = setTimeout(function () {
        that.setData({
          show: false,
          showCoupon: false
        })
        clearTimeout(time1)
        time1 = null
      }, 220) // 先执行下滑动画，再隐藏模块
    },
    // 动画 -- 滑入
    slideIn () {
      this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
      this.setData({
        //  动画实例的export方法导出动画数据传递给组件的animation属性
        animationData: this.animation.export()
      })
    },
    // 动画 -- 滑出
    slideDown () {
      this.animation.translateY(2000).step()
      this.setData({
        animationData: this.animation.export()
      })
    }
  }
})
