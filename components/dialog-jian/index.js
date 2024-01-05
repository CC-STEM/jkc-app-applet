import { get } from '../../utils/index'
import dayjs from 'dayjs'
import { typeObj } from '../../utils/constants'

function getNeedDate (str) {
  return dayjs(str).format('MM.DD')
}

Component ({
  properties: {
    show: {
      type: Boolean,
      value: false
    }, // 这里定义了modalHidden属性，属性值可以在组件使用时指定.写法为modal-hidden
    defaultData: {
      type: Array,
      value: []
    },
    coupon: {
      type: Array,
      value: {}
    },
    allData: {
      type: Object,
      value: {}
    },
  },
  /**
  * 页面的初始数据
  */
  data: {
    dataSource: [],
    curCoupon: {},
    animationData: {},
    typeObj: typeObj,
    selectedList: [], // 所选课程id
    batchNoList: [] // 所选课程batch_no
  },
  lifetimes: {
    attached () {
      console.log('>>jianData', this.data.defaultData)
    }
  },
  methods: {
    onSelect ({ currentTarget }) {
      const { item, index } = currentTarget.dataset
      let { coupon = [], defaultData } = this.data
      const index1 = coupon.indexOf(item.id)
      if (index1 > -1) {
        coupon.splice(index1, 1)   
      } else {
        coupon.push(item.id)
      }

      defaultData[index] = {
        ...defaultData[index],
        selected: index1 == -1 ? 1 : 0
      }     
      this.triggerEvent('ok', { 
        coupon: [...coupon], 
        list: [...defaultData]
      })
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
