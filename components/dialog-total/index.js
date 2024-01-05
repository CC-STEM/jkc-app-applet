import { ageMap } from '../../utils/constants'

Component ({
  properties: {
    show: {
      type: Boolean,
      value: false
    }, // 这里定义了modalHidden属性，属性值可以在组件使用时指定.写法为modal-hidden
    title: {
      type: String,
      value: '请选择学员年龄'
    },
    value: {
      type: Number,
      value: 0
    }
  },
  /**
  * 页面的初始数据
  */
  data: {
    optionList: ageMap,
    // hideFlag: false, // true-隐藏 false-显示
    animationData: {},
    typeMap: [
      { name: '常规班', value: 1, type: 1 },
      { name: '精品班', value: 1, type: 2 },
      { name: '精品小班', value: 1, type: 3 },
      { name: '商品', value: 1, type: 4 },
      { name: '会员卡', value: 1, type: 5 },
      { name: '特殊奖励', value: '...', type: 6 },
    ],
    touchDot: 0, //触摸时的原点
    time: 0, // 时间记录，用于滑动时且时间小于1s则执行左右滑动
    interval: '',// 记录/清理 时间记录
    isUp: false,// 判断不再执行滑动事件
    
  },
  methods: {
    onShowTotal() {
      this.setData({
        showTotal: true
      })
    },
    onSelect () {
      this.triggerEvent('ok', { age: this.data.value })
    },
    // 点击选项
    getOption (e) {
      this.setData({
        value: Number(e.currentTarget.dataset.value)
      })
    },
    // 取消
    mCancel () {
      this.hideModal()
    },
    // 触摸开始事件
    touchStart (e) { 
      const { time } = this.data
      // 使用js计时器记录时间  
      this.setData({
        touchDot: e.touches[0].pageY, // 获取触摸时的原点
        interval: setInterval(() => {
          this.setData({ time: time + 1 })
        }, 100)
      })
    },
    // 触摸移动事件
    touchMove (e) { 
      let { touchDot, time, nth, nthMax, isUp } = this.data
      let touchMove = e.touches[0].pageY;
      console.log(touchMove, 1, touchDot, 2 , touchMove - touchDot,3, time, 4)
      // 向下滑动  
      if (touchMove - touchDot <= -30 && time < 10) { 
        !isUp && this.setData({ isUp: true })
      }
      // 向上滑动
      if (touchMove - touchDot >= 30 && time < 10) {
        isUp && this.setData({ isUp: false })
      }
      // touchDot = touchMove; //每移动一次把上一次的点作为原点（好像没啥用）
    },
    // 触摸结束事件
    touchEnd (e) {
      const { interval } = this.data
      // 清除setInterval
      if (interval) {
        this.setData({
          interval: clearInterval(interval)
        })
      }
      this.setData({
        time: 0,
        tmpFlag: true
      })
    },
    // // 显示遮罩层
    // showModal () {
    //   const that = this
    //   this.setData({
    //     hideFlag: false
    //   })
    //   // 创建动画实例
    //   const animation = wx.createAnimation({
    //     duration: 400, // 动画的持续时间
    //     timingFunction: 'ease' //动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    //   })
    //   this.animation = animation // 将animation变量赋值给当前动画
    //   let time1 = setTimeout(function () {
    //     that.slideIn() // 调用动画--滑入
    //     clearTimeout(time1)
    //     time1 = null
    //   }, 100)
    // },
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
