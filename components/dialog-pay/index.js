
Component ({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    money: {
      type: String,
      value: ''
    },
    url: {
      type: String,
      value: ''
    },
    type: {
      type: String,
      value: ''
    }
  },
  /**
  * 页面的初始数据
  */
  data: {
    type: 2
  },
  lifetimes: {
    attached () {
      this.setData({ type: this.data.type })
    }
  },
  methods: {
    onCopy () {
      wx.showToast({
        title: '复制成功'
      })
      wx.setClipboardData({ data: this.data.url })
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
