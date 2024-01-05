import qrcode from 'qrcode-generator'
import { uploadUrlHost, defaultAvatar } from '../../utils/constants'
import { get, post } from '../../utils/index'

const app = getApp ()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 海报
    posterDatas: {
      width: 309, // 画布宽度
      height: 438, // 画布高度
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
      title: '推荐好友'
    },
    timer: null,
    timer1: null,
    uploadUrlHost: uploadUrlHost,
    qrcode: '',
    name: '',
    desc: '',
    avatar: 'https://image.jkcspace.com/wxmini_static/images/my-avatar.png',
    bgImg: 'https://image.jkcspace.com/wxmini_static/images/invite-bg1.png',
    showConfirm: false,
    confirmData: {
      title: '规则说明',
      okText: '我知道了',
      hideCancel: true,
      isPoster: true,
      content: ''
    },
    // imgUrl: 'https://img0.baidu.com/it/u=2529320505,1328670466&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=500',
    imgUrl: 'https://image.jkcspace.com/wxmini_static/images/invite-img.png',
    id: '473479202278035456',
    pixelRatio: 2,
    showDom: false,
  },
  onShow() {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          pixelRatio: res.pixelRatio
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    options.id && this.setData({ id: options.id })
    this.getQrcode()
    wx.showLoading({
      title: '海报生成中',
      mask: true
    })
    setTimeout(() => {
      wx.hideLoading()
    }, 10000)
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
  getQrcode () {
    get('/member/qr_code')
      .then(({ data }) => {
        this.setData({
          qrcode: `${uploadUrlHost}/${data.qc_code}`
        })
        this.getDetails()
      })
  },
  getDetails () {
    get('/teacher_identity/teacher_info')
      .then(({ data }) => {
        this.setData({
          avatar: data.avatar || defaultAvatar,
          // imgUrl: `${uploadUrlHost}/${data.img_url}`,
          name: data.teacher_name || '老师',
          desc: data.physical_store_name || 'CC编程门店',
          // qrcode: `${uploadUrlHost}/${data.qc_code}`
        })
        this.initCanvas()
      })
  },
  // 海报生成
  // 画布 生成 海报[海报]
  onBuildPosterSaveAlbum () {
    const that = this
    const { posterDatas, bgImg, name, desc, avatar, qrcode, imgUrl, pixelRatio } = that.data
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
    
    // 商品图
    const promise2 = new Promise(function (resolve, reject) {
      const photo = canvas.createImage()
      photo.src = imgUrl
      photo.onload = (e) => {
        resolve(photo)
      }
    })

    // 头像
    const promise3 = new Promise(function (resolve, reject) {
      const photo = canvas.createImage()
      photo.src = avatar
      photo.onload = (e) => {
        resolve(photo)
      }
    })

    // 二维码
    const promise4 = new Promise(function (resolve, reject) {
      const photo = canvas.createImage()
      photo.src = qrcode
      photo.onload = (e) => {
        resolve(photo)
      }
    })
    // 获取图片信息
    Promise.all(
      [promise1, promise2, promise3, promise4]
    ).then(res => {
      // 绘制白色背景
      // util.roundRect(ctx, 0, 0, posterDatas.width, posterDatas.height, 10);
      ctx.fillStyle = 'rgba(255, 255, 255, 0)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制背景图
      that.circleImgTwo(ctx, res[0], 0, 0, 309, 436, 10)

      // 绘制[商品图片]
      that.circleImgTwo(ctx, res[1], 13, 76, 282, 174, 10)

      // 绘制[头像]
      that.circleImgTwo(ctx, res[2], 13, 266, 30, 30, 15)

      // 绘制分享文案
      ctx.font = 'bold 15px Arial' // 字体大小
      ctx.fillStyle = '#000' // 字体颜色
      ctx.fillText(name, 48, 286) // 第二个参数为了文字剧中

      ctx.font = 'bold 15px Arial' // 字体大小
      ctx.fillStyle = '#000' // 字体颜色
      ctx.fillText(desc, 13, 316)

      // 绘制[二维码]
      that.circleImgTwo(ctx, res[3], 14, 352, 74, 74, 37)

      // 绘制分享文案
      ctx.font = 'bold 13px Arial' // 字体大小
      ctx.fillStyle = '#111' // 字体颜色
      ctx.textAlign = 'right'
      ctx.fillText('长按识别个人码', 294, 382) // 第二个参数为了文字剧中

      const text = `来自${name}的分享`
      let w = ctx.measureText(text).width

      ctx.font = '13px Arial' // 字体大小
      // ctx.fillStyle = '#111' // 字体颜色‘
      ctx.lineJoin = "round";
      ctx.lineWidth = 22;
      ctx.strokeRect(canvas.width / pixelRatio - w - 24, 400, w, 0);
      ctx.fillStyle = '#fff' // 字体颜色
      ctx.textAlign = 'right'
      ctx.fillText(text, canvas.width / pixelRatio - 24, 405)

      // 虚线
      ctx.lineWidth = 1
      ctx.lineHeight = 1
      ctx.moveTo(294, 338)
      ctx.lineTo(14, 338)
      ctx.strokeStyle= "#D8D8D8";
      ctx.setLineDash([2]);
      ctx.lineDashOffset = -50;
      ctx.stroke()
      ctx.clip()

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
    // ctx.strokeStyle = '#FFFFFF' // 设置绘制圆形边框的颜色
    // ctx.stroke()
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
    // ctx.strokeStyle = '#FFFFFF' // 设置绘制圆形边框的颜色
    // ctx.stroke()
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
  onShareImges() {
    wx.showShareImageMenu({
      path: this.data.posterDatas.pic,
    })
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
      fail: function (res) {
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
    this.setData({ showDom: true })
  },
  // onShareAppMessage () {
  //   return {
  //     title: 'CC编程，课程好 按月付，家长孩子两不误',
  //     path: `/pages/index/index`,
  //     imageUrl: this.data.posterDatas.pic
  //   }
  // },
  // onShareTimeline () {
  //   return {
  //     title: 'CC编程，课程好 按月付，家长孩子两不误',
  //     path: `/pages/index/index`,
  //     imageUrl: this.data.posterDatas.pic
  //   }
  // },
  onHideDom () {
    this.setData({ showDom: false })
  }
})
