import { get, post } from '../../utils/index'

Page ({
  /**
  * 页面的初始数据
  */
  data: {
    optionList: [
      {
        name: '两岁',
        value: 2
      }, {
        name: '三岁',
        value: 3
      }, {
        name: '四岁',
        value: 4
      }, {
        name: '五岁',
        value: 5
      }, {
        name: '六岁',
        value: 6
      }, {
        name: '七岁',
        value: 7
      }, {
        name: '八岁',
        value: 8
      }, {
        name: '九岁',
        value: 9
      }, {
        name: '十岁',
        value: 10
      }, {
        name: '十一岁',
        value: 11
      }, {
        name: '十二岁',
        value: 12
      }, {
        name: '十三岁',
        value: 13
      }
    ],
    curVal: 4,
    hideFlag: false, // true-隐藏 false-显示
    animationData: {}
  },
  // 点击选项
  getOption (e) {
    this.setData({
      curVal: e.currentTarget.dataset.value
    })
  },
  // 取消
  mCancel () {
    this.hideModal()
  },
  onSubmit () {
    this.hideModal()
    post('/member/set_age', {
      age: this.data.curVal
    })
      .then(res => {
        this.setData({
          hideFlag: false
        })
      })
  },
  // 显示遮罩层
  showModal () {
    this.setData({
      hideFlag: false
    })
    // 创建动画实例
    var animation = wx.createAnimation({
      duration: 400, // 动画的持续时间
      timingFunction: 'ease' //动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    })
    this.animation = animation; //将animation变量赋值给当前动画
    var time1 = setTimeout(function () {
      that.slideIn() // 调用动画--滑入
      clearTimeout(time1)
      time1 = null
    }, 100)
  },
  // 隐藏遮罩层
  hideModal () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 400, // 动画的持续时间 默认400ms
      timingFunction: 'ease' // 动画的效果 默认值是linear
    })
    this.animation = animation
    that.slideDown() //调用动画--滑出
    var time1 = setTimeout(function () {
      that.setData({
        hideFlag: true
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
      animationData: this.animation.export(),
    })
  },
 })