import { uploadUrlHost } from '../../utils/constants'
import { get } from '../../utils/index'
import WxParse from '../wxParse/wxParse.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 海报
    posterDatas: {
      width: 288, // 画布宽度
      height: 384, // 画布高度
      // 缓冲区，无需手动设定
      pic: null,
      buttonType: 1,
      show: false, // 显示隐藏海报弹窗
      success: false, // 是否成功生成过海报
      canvas: null, // 画布的节点
      ctx: null, // 画布的上下文
      dpr: 1 // 设备的像素比
    },
    defaultData: {
      title: '推荐好友',
      hideShare: true
    },
    data: null,
    article: '',
    timer: null,
    timer1: null,
    uploadUrlHost: uploadUrlHost,
    showConfirm: false,
    confirmData: {
      title: '规则说明',
      okText: '我知道了',
      hideCancel: true,
      isPoster: true,
      content: ''
    },
    showShare: false,
    userInfo: {},
    qrcode: '',
    showDom: false,
    bgImg: 'https://image.jkcspace.com/wxmini_static/images/invite-bg3.png',
    disabledBtn: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    console.log('>>options1', options, 'share' in options)
    if (options.share) {
      this.setData({
        defaultData: {
          ...this.data.defaultData,
          shareId: options.share
        }
      })
      this.setData({ disabledBtn: true })
    } else {
      this.setData({ disabledBtn: false })
      this.getInfo()
    }

    console.log('>>onLoad', this.data.defaultData)
   
    this.getDetails()
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {
    // 销毁定时器
    console.log("+++++++++onUnload++++++++++")
    this.data.timer && clearTimeout(this.data.timer)
    this.data.timer1 && clearTimeout(this.data.timer1)
  },
  onShowModal () {
    this.setData({ showConfirm: true })
  },
  onCancel () {
    this.setData({ showConfirm: false })
  },
  onShowShare () {
    if (this.data.disabledBtn) return
    this.setData({
      showShare: true
    })
    if (this.data.posterDatas.pic) return
    this.getQrcode()
    wx.showLoading({
      title: '海报生成中',
      mask: true
    })
  },
  getQrcode () {
    get('/member/qr_code', {
      type: 2
    })
      .then(({ data }) => {
        this.setData({
          qrcode: `${uploadUrlHost}/${data.qc_code}`
        })
        this.initCanvas()
      })
  },
  getInfo () {
    get('/member/info')
      .then(({ data }) => {
        this.setData({ userInfo: data })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  getDetails () {
    get('/discount_ticket/marketing_info')
      .then(({ data }) => {
        if (!data) return
        const article = data.describe.replace(/\n/gi, '<br\>')
        this.setData({
          data: data,
          article
        })
        WxParse.wxParse('article', 'html', article, this, 5)
      })
  },
  initCanvas () {
    const that = this
    // 生成海报初始化
    const posterDatas = that.data.posterDatas
    const query = wx.createSelectorQuery()
    query.select('#firstCanvas').fields({
      node: true,
      size: true
    },
    function (res) {
      const canvas = res.node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio
      canvas.width = posterDatas.width * dpr
      canvas.height = posterDatas.height * dpr
      ctx.scale(dpr, dpr)
      posterDatas.canvas = canvas
      posterDatas.ctx = ctx
      posterDatas.dpr = dpr
      // 存储
      that.setData({
        posterDatas
      }, () => {
        const timer = setTimeout(() => that.onBuildPosterSaveAlbum(), 3000)
        that.setData({ timer })
      })
    }).exec()
  },
  // 海报生成
  // 画布 生成 海报[海报]
  onBuildPosterSaveAlbum () {
    const that = this
    const { posterDatas, bgImg, qrcode } = that.data
    const canvas = posterDatas.canvas
    const ctx = posterDatas.ctx
    // 已生成过海报的直接显示弹窗
    if (posterDatas.success) {
      posterDatas['show'] = true
      that.setData({
        posterDatas
      })
      return
    }
    posterDatas.show = true
    that.setData({
      posterDatas
    })

    // bg
    const promise1 = new Promise(function (resolve, reject) {
      const photo = canvas.createImage()
      photo.src = bgImg
      photo.onload = (e) => {
        resolve(photo)
      }
    })

    // 二维码
    const promise2 = new Promise(function (resolve, reject) {
      const photo = canvas.createImage()
      photo.src = qrcode
      photo.onload = (e) => {
        resolve(photo)
      }
    })

    // 获取图片信息
    Promise.all(
      [promise1, promise2]
    ).then(res => {
      // 绘制白色背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0)'
      ctx.fillRect(0, 0, canvas.width, canvas.height, 10)

      // 绘制背景图
      that.circleImgTwo(ctx, res[0], 0, 0, 288, 384, 10)
     
      // 绘制分享文案
      ctx.font = 'bold 16px Arial' // 字体大小
      ctx.fillStyle = '#000' // 字体颜色
      ctx.fillText('邀请好友赢好礼', 12, 330) // 第二个参数为了文字剧中

      ctx.font = '500 12px Arial' // 字体大小
      ctx.fillStyle = '#646464' // 字体颜色
      ctx.fillText('长按小程序码识别', 12, 350)

      // 绘制[二维码]
      that.circleImgTwo(ctx, res[1], 198, 302, 68, 68, 34)

      // 关闭loading
      wx.hideLoading()
      // 显示海报
      posterDatas.success = true
      that.setData({
        posterDatas
      })
      that.onCanvasBuildImges()
    }).catch(err => {
      console.log(err)
      wx.hideLoading()
      wx.showToast({
        icon: 'none',
        title: '海报生成失败,请稍后再试.'
      })
    })
  },
  circleImgOne (ctx, img, x, y, r) {
    ctx.save() // 保存当前 Canvas 画布状态
    ctx.arc(x + r, y + r, r, 0, 2 * Math.PI)
    ctx.strokeStyle = '#FFFFFF' // 设置绘制圆形边框的颜色
    ctx.stroke()
    ctx.clip()
    ctx.drawImage(img, x, y, r * 2, r * 2)
    ctx.restore() // 恢复到保存时的状态
  },
  circleImgTwo (ctx, img, x, y, w, h, r) {
    // 画一个图形
    ctx.save() // 保存当前 Canvas 画布状态
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y, x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x, y + h, r)
    ctx.arcTo(x, y + h, x, y, r)
    ctx.arcTo(x, y, x + w, y, r)
    ctx.closePath()
    ctx.strokeStyle = '#FFFFFF' // 设置绘制圆形边框的颜色
    ctx.stroke()
    ctx.clip()
    ctx.drawImage(img, x, y, w, h)
    ctx.restore() // 恢复到保存时的状态
  },
  // 画布 转 图片[海报]
  onCanvasBuildImges (isDownload) {
    const { posterDatas } = this.data
    const that = this
    const timer1 = setTimeout(() => {
      wx.canvasToTempFilePath({
        canvas: posterDatas.canvas,
        width: posterDatas.width,
        height: posterDatas.height,
        destWidth: posterDatas.width * posterDatas.dpr,
        destHeight: posterDatas.height * posterDatas.dpr,
        fileType: 'png',
        // 图片质量
        quality: 1,
        success: function success (res) {
          posterDatas['pic'] = res.tempFilePath
          that.setData({
            posterDatas
          })
          isDownload && that.onDownloadImges()
        },
        fail: function complete (e) {
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '网络不好,请稍后再试.'
          })
        }
      })
    }, 200)
    that.setData({ timer1 })
  },
  // 下载图片[海报]
  onDownloadImges () {
    wx.showLoading({
      title: '保存中',
      mask: true
    })
    const that = this
    const posterDatas = that.data.posterDatas
    if (!posterDatas.pic) {
      that.onCanvasBuildImges(true)
      return
    }
    // 可写成函数调用 这里不做解释
    wx.saveImageToPhotosAlbum({
      filePath: posterDatas.pic,
      success(res) {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '已保存到相册，快去分享吧'
        })
        that.setData({
          posterDatas
        })
      },
      fail (res) {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '进入设置页，开启“保存到相册”'
        })
        that.setData({
          posterDatas
        })
      }
    })
  },

  // 在打开授权设置页后回调
  onBindOpenSetting () {
    var that = this
    var posterDatas = that.data.posterDatas
    posterDatas["buttonType"] = 1
    that.setData({
      posterDatas
    })
  },

  // 隐藏海报[海报]
  onIsCanvas () {
    var that = this;
    var posterDatas = that.data.posterDatas;
    posterDatas["buttonType"] = 1
    posterDatas["show"] = false
    that.setData({
      posterDatas
    })
  },
  // 自定义弹窗后禁止屏幕滚动（滚动穿透）[海报]
  preventTouchMove () {
    // 在蒙层加上 catchtouchmove 事件
    // 这里什么都不要放
  },
  onSharefriends () {
    this.setData({ 
      showDom: true
    })
  },
  onHideDom () {
    this.setData({ showDom: false })
  },
  onShareImges() {
    wx.showShareImageMenu({
      path: this.data.posterDatas.pic,
    })
  },
  onShareAppMessage () {
    const { userInfo } = this.data

    return {
      title: 'CC编程，课程好 按月付，家长孩子两不误',
      path: `pages/ground/index?id=${userInfo.id}&type=1`,
      imageUrl: this.data.posterDatas.pic
    }
  },
  onShareTimeline () {
    const { userInfo } = this.data
    console.log('>>>onShareTimeline', userInfo)
    
    return {
      title: `${userInfo.name}邀请你来一起学习啦，快来一起叭～`,
      path: `/pages/ground/index`,
      query: `share=${userInfo.id}`,
      imageUrl: this.data.posterDatas.pic
    }
  },
  goPage () {
    this.setData({ 
      showShare: false
    })
  },
  goPage2() {
    if (this.data.disabledBtn) return

    wx.navigateTo({
      url: '/pages/reduction/index'
    })
   }
})
