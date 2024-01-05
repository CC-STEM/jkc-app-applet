import { slideDown, slideIn, hideModal } from '../../utils/func'

Component ({
  properties: {
    show: {
      type: Boolean,
      value: false
    }, // 这里定义了modalHidden属性，属性值可以在组件使用时指定.写法为modal-hidden
    defaultData: {
      type: Object,
      value: {
        title: '延期',
        tips: '延期',
        placeholder: '请输入天数，最多180天',
        number: null
      }
    }
  },
  /**
  * 页面的初始数据
  */
  data: {
    number: null
  },
  lifetimes: {
    attached () {
      this.setData({ number: this.data.defaultData.number })
    }
  },
  methods: {
    onOk ({ currentTarget }) {
      console.log('>>onOk', this.data.number)
      this.triggerEvent('ok', { number: this.data.number })
    },
    formInputChange ({ currentTarget, detail }) {
      // const field = currentTarget.dataset && currentTarget.dataset.field
      this.setData({ number: detail.value })
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
      this.animation.translateY(2000).step()
      this.setData({
        animationData: this.animation.export()
      })
    } 
  }
})
