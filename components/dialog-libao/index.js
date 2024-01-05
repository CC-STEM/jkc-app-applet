import { uploadUrlHost } from '../../utils/constants'
import { get, post } from '../../utils/index'
const app = getApp()

Component ({
  properties: {
    show: {
      type: Boolean,
      value: false
    }, // 这里定义了modalHidden属性，属性值可以在组件使用时指定.写法为modal-hidden
    // defaultData（父页面传递的数据-就是引用组件的页面）
    defaultData: {
      type: Object,
      value: {}
    },
    defaultLibao: {
      type: Object,
      value: {}
    },
    defaultList: {
      type: Array,
      value: []
    }
  },
  /**
  * 页面的初始数据
  */
  data: {
    uploadUrlHost: uploadUrlHost,
    showStore: false,
    storeList: [],
    vipList: [],
    data: {},
    number: ''
  },
  lifetimes: {
    attached () {
      if (app.globalData.storeList.length) {
        this.setData({ list: app.globalData.storeList })
        return
      }
      get('/store/list').then(res => {
        app.globalData.storeList = res.data.list
        this.setData({ list: res.data.list })
      })
    }
  },
  methods: {
    onBuy () {
      if (!app.globalData.token) {
        wx.navigateTo({ url: `/pages/auth/index` })
        return
      }
      const { defaultLibao, number, defaultData } = this.data
      post('/vip_card/buy', {
        id: defaultLibao.id,
        recommend_code: number,
        physical_store_id: defaultData.id
      })
        .then(({ data }) => {
          wx.requestPayment({
            nonceStr: data.nonce_str,
            package: data.package,
            paySign: data.pay_sign,
            signType: data.sign_type,
            timeStamp: data.time_stamp,
            success: (res) => {
              this.mCancel()
              if (app.globalData.userInfo.information_card_status != 1) {
                wx.navigateTo({
                  url: '/pages/my/ziliao/index'
                })
                return
              }
              wx.switchTab({
                url: '/pages/offcourse/index?isBuy=1',
                success: () => {
                  wx.showToast({ title: '您已成功购买体验卡，请尽快约课吧！', icon: 'none' })
                }
              })
            },
            fail: (res) => {
              this.mCancel()
              console.log(res, '>>>fail')
            }
          })
        })
    },
    onShowModal () {
      this.setData({ showStore: true })
    },
    onCancel () {
      this.setData({ showStore: false, showConfirm: false })
    },
    onOk2 ({ detail }) {
      this.getNewcomer(detail.store.id, () => {
        this.setData({ defaultData: detail.store })
      })
    },
    getNewcomer (sid, cb) {
      get('/vip_card/newcomer', {
        physical_store_id: sid
      })
        .then(({ data, msg }) => {
          if (data.id) {
            this.setData({
              defaultLibao: { ...data }
            })
            cb && cb()
          } else {
            wx.showToast({ title: msg, icon: 'none' })
          }
        })
    },
    formInputChange ({ currentTarget, detail }) {
      const field = currentTarget.dataset && currentTarget.dataset.field
      this.setData({ number: detail.value })
    },
    onSetCode () {
      post('/member/set_referral_code', {
        referral_code: this.data.number
      })
        .then(res => {
          wx.showToast({
            title: '设置成功'
          })
        })
    },
    onOk () {
      this.triggerEvent('ok', false)
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
          show: false
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
      this.animation.translateY(1500).step()
      this.setData({
        animationData: this.animation.export()
      })
    }
  }
})
