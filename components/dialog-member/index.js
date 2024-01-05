import { get } from '../../utils/index'
import { memberTypeMap } from '../../utils/constants'

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
    curVal: {
      type: String,
      value: null
    },
    defaultData: {
      type: Object,
      value: {
        type1: '',
        type2: '',
        title1: '',
        hide2: false
      }
    }
  },
  /**
  * 页面的初始数据
  */
  data: {
    teacherList: [],
    animationData: {},
    memberTypeMap: memberTypeMap,
    type1: '',
    type2: '',
    hide2: false,
    title1: ''
  },
  lifetimes: {
    attached () {
      console.log('>>>this.data.defaultData.hide2', this.data.defaultData)
      this.setData({ 
        type1: this.data.defaultData.type1,
        type2: this.data.defaultData.type2 || '',
        title1: this.data.defaultData.title1,
        hide2: this.data.defaultData.hide2
      })
      this.handleGetList()
    }
  },
  methods: {
    handleGetList () {
      get('/store_manager/teacher_list')
        .then(({ data }) => {
          this.setData({
            teacherList: data.list
          })
        })
    },
    onSelect () {
      this.triggerEvent('ok', { type1: this.data.type1, type2: this.data.type2 })
      this.mCancel()
    },
    // 点击选项
    getOption1 (e) {
      this.setData({
        type1: e.currentTarget.dataset.value
      })
    },
     // 点击选项
     getOption2 (e) {
      this.setData({
        type2: e.currentTarget.dataset.value
      })
    },
    // 取消
    mCancel () {
      this.hideModal()
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
