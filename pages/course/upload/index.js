import { get, post, upload } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'

const app = getApp ()

Page ({
  data: {
    videoUrl: '',
    defaultData: {
      title: '上传作品' // 导航栏标题
    },
    name: '',
    desc: '',
    remark: '',
    uploadUrlHost: uploadUrlHost
  },
  onLoad (options) {
    const { id, name, videoUrl, desc } = options
    id && this.setData({ id, name, videoUrl, desc })
    this.handleGetList()
  },
  handleGetList () {
    get('/online_course/collect_child_detail', {
      id: this.data.id
    }, {
      showLoading: true
    })
      .then(({ data }) => {
        this.setData({
          name: data.name,
          videoUrl: data.study_video_url,
          desc: data.member_explain,
          remark: data.examine_explain
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  handleChangeData ({ currentTarget, detail }) {
    const field = currentTarget.dataset && currentTarget.dataset.field
    if (field) {
      this.setData({ [field]: detail.value }) // express_number
    }
  },
  onSubmit () {
    if (!this.data.videoUrl) {
      wx.showToast({
        title: '请上传作品',
        icon: 'none'
      })
      return
    }
    post('/online_course/add_study_opus', {
      id: this.data.id,
      study_video_url: this.data.videoUrl,
      member_explain: this.data.desc
    })
      .then(res => {
        wx.navigateTo({
          url: `/pages/poster/index?id=${this.data.id}`
        })
      })
  },
  onDelete () {
    this.setData({ videoUrl: '' })
  },
  // 上传视频
  onChooseVideo () {
    const that = this
    // console.log('上传视频的方法')
    wx.chooseMedia({
      count: 1, // 上传视频的个数
      mediaType: ['video'], // 限制上传的类型为video
      sourceType: ['album', 'camera'], // 视频选择来源
      maxDuration: 58, // 拍摄限制时间
      camera: 'back', // 采用后置摄像头
      success: function (res) {
        // 获取临时存放的视频资源
        const tempFilePath = res.tempFiles[0].tempFilePath
        // 获取该视频的播放时间
        const duration = res.tempFiles[0].duration
        // console.log("视频播放时间为" + duration)
        // 获取视频的大小(MB单位)
        const size = parseFloat(res.tempFiles[0].size/1024/1024).toFixed(1)
        // console.log("视频大小为" + size)
        // 获取视频的高度
        const height = res.tempFiles[0].height
        // console.log("视频高度为" + height)
        // 获取视频的宽度
        const width = res.tempFiles[0].width
        // console.log("视频宽度为" + width)
        // 校验大小后，符合进行上传
        // if (size > 20) {
        //     let beyongSize = size - 20 //获取视频超出限制大小的数量
        //     wx.showToast("上传的视频大小超限,超出"+beyongSize+"MB,请重新上传！")
        //     return
        // } else{
        // 符合大小限制，进行上传
        // console.log("开始上传！！！", res, tempFilePath, upload)
        upload({
          filePath: tempFilePath // 选取的视频资源临时地址
        }, {
          showLoading: true
        }).then(({ data }) => {
          // console.log('>>data', data)
          that.setData({ videoUrl: data.key })
        })
        // }
      },
    })
  },

  // 查看图片
  ViewImage(e) {
    let that=this
    let imgArr = that.data.fileList.filter((x)=>{return x.type =="img"}).map(x=>x.path)
    wx.previewImage({
      urls: imgArr,
      current: e.currentTarget.dataset.url
    });
  },
  // 删除图片
  DelImg (e) {
    let that = this
    wx.showModal({
      title: '提示',
      content: '是否删除照片',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        // console.log(res)
        if (res.confirm) {
          that.data.fileList.splice(e.currentTarget.dataset.index, 1);
          that.setData({
            fileList: that.data.fileList
          })
        }
      }
    })
  }
})
