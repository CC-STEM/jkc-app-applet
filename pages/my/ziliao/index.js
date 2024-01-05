import { get, post } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'

const app = getApp()

Page({
  data: {
    defaultData: {
      noBgColor: true,
      // type: 1,
      // title: '购卡开通会员',
      // isWhite: true
    },
    formData: {
      avatar: '',
      name: '',
      gender: 0,
      birthday: '',
      parent_mobile: '',
      school: '',
      channel: ''
    },
    tagArr: ['朋友介绍', '自己进店咨询', '户外活动', '其他途径']
  },
  onLoad (options) {
    
  },
  // pickSex (e) {
  //   this.setData({
  //     formData: {
  //       ...this.data.formData,
  //       gender: e.detail.value
  //     }
  //   })
  // },
  onSubmit () {
    const { formData } = this.data
    const re = /^[0-9]*$/ // 判断字符串是否为数字
    const re2 = /^[\u4e00-\u9fa5]*$/ // 判断字符串是否汉字

    if (!formData.name) {
      wx.showToast({ icon: 'none', title: '请填写孩子名字' })
      return
    } else if (!re2.test(formData.name)) { 
      wx.showToast({ title: '请填写正确的孩子名字', icon: 'none' })
      return
    }

    if (!formData.birthday) {
      wx.showToast({ icon: 'none', title: '请填写出生日期' })
      return
    }

    if (!formData.parent_mobile) {
      wx.showToast({ icon: 'none', title: '请填写家长联系方式' })
      return
    } else if (!re.test(formData.parent_mobile)) { 
      wx.showToast({ title: '请填写正确的家长联系方式', icon: 'none' })
      return
    }

    if (!formData.channel) {
      wx.showToast({ icon: 'none', title: '请选择您是如何知晓CC编程' })
      return
    }

    post('/member/set_member_data', {
      ...formData
    })
      .then(res => {
        app.globalData.userInfo = {
          ...app.globalData.userInfo,
          ...formData,
          information_card_status: 1
        }
        this.setData({
          userInfo: {
            ...formData
          }
        })
        
        wx.switchTab({
          url: '/pages/index/index'
        })
      })
  },
  // 日期筛选
  bindDateChange (e) {
    this.setData({
      formData: {
        ...this.data.formData,
        birthday: e.detail.value
      }
    })
  },
  handleChangeData ({ currentTarget, detail }) {
    const field = currentTarget.dataset && currentTarget.dataset.field
    if (field) {
      this.setData({
        formData: {
          ...this.data.formData,
          [field]: detail.value
        }
      })
    }
  },
  onDeleteImg ({ currentTarget }) {
    this.setData({
      formData: {
        ...this.data.formData,
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
            formData: {
              ...that.data.formData,
              avatar: data.key
            }
          })
        })
      }
    })
  },
  onChangeTag ({ currentTarget }) {
    const type = currentTarget.dataset.type
    this.setData({
      formData: {
        ...this.data.formData,
        channel: type
      }
    })
  },
})
