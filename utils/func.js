import dayjs from 'dayjs'
import './zh-cn'

dayjs.locale('zh-cn')

let animation
let animationData

function hideModal () {
  // this.triggerEvent('cancel', false)
  const that = this
  animation = wx.createAnimation({
    duration: 400, // 动画的持续时间 默认400ms
    timingFunction: 'ease' // 动画的效果 默认值是linear
  })
  // this.animation = animation
  that.slideDown() // 调用动画--滑出
  let time1 = setTimeout(function () {
    that.setData({
      show: false
    })
    clearTimeout(time1)
    time1 = null
  }, 220) // 先执行下滑动画，再隐藏模块
}

// 动画 -- 滑入
function slideIn () {
  animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
  animationData = animation.export()
  this.setData({
    //  动画实例的export方法导出动画数据传递给组件的animation属性
    animationData: animation.export()
  })
}
// 动画 -- 滑出
function slideDown () {
  animation.translateY(2000).step()
  animationData = animation.export()

  this.setData({
    animationData: this.animation.export()
  })
}

module.exports = {
  hideModal,
  slideIn
}
