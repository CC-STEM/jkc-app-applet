Page ({
  properties: {
    show: {
      type: Boolean,
      value: false
    }, // 这里定义了modalHidden属性，属性值可以在组件使用时指定.写法为modal-hidden
    // defaultData（父页面传递的数据-就是引用组件的页面）
    defaultData: {
      type: Object,
      value: {
        name: '',
        number: ''
      },
      observer: function (newVal, oldVal) {}
    }
  },
  /**
  * 页面的初始数据
  */
  data: {
    desc: ''
  },
  onSubmit () {
    this.triggerEvent('ok', {
      desc: this.data.desc
    })
  },
  handleChangeData ({ currentTarget, detail }) {
    const field = currentTarget.dataset && currentTarget.dataset.field
    if (field) {
      this.setData({ [field]: detail.value }) // express_number
    }
  },
  onCopy () {
    wx.setClipboardData({ data: this.data.dataSource.package.express_number })
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
})
