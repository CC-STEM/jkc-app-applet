import { sexMap, uploadUrlHost } from '../../utils/constants'
import { upload } from '../../utils/index'

Component ({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    defaultData: {
      type: Object,
      value: {
        avatar: '',
        name: '',
        gender: 0,
        birthday: '',
        parent_mobile: '',
        school: '',
        channel: ''
      }
    }
  },
  /**
  * 页面的初始数据
  */
  data: {
    sexMap: sexMap,
    uploadUrlHost: uploadUrlHost,
  },
  methods: {
    pickSex (e) {
      this.setData({
        defaultData: {
          ...this.data.defaultData,
          gender: e.detail.value
        }
      })
    },
    onSubmit () {
      this.triggerEvent('ok')
    },
    // 日期筛选
    bindDateChange (e) {
      this.setData({
        defaultData: {
          ...this.data.defaultData,
          birthday: e.detail.value
        }
      })
    },
    handleChangeData ({ currentTarget, detail }) {
      const field = currentTarget.dataset && currentTarget.dataset.field
      if (field) {
        this.setData({
          defaultData: {
            ...this.data.defaultData,
            [field]: detail.value
          }
        })
      }
    },
    onDeleteImg ({ currentTarget }) {
      this.setData({
        defaultData: {
          ...this.data.defaultData,
          avatar: ''
        }
      })
    },
    ChooseImage () {
      const that = this
      wx.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: (res) => {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片

          upload({
            filePath: res.tempFilePaths[0] // 选取的视频资源临时地址
          }).then(({ data }) => {
            that.setData({
              defaultData: {
                ...that.data.defaultData,
                avatar: data.key
              }
            })
          })
        }
      })
    },
    onCopy () {
      wx.setClipboardData({ data: this.data.dataSource.package.express_number })
    },
    onChangeTag ({ currentTarget }) {
      const type = currentTarget.dataset.type
      console.log(type)
      this.setData({
        defaultData: {
          ...this.data.defaultData,
          channel: type
        }
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
