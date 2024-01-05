import { get, post } from '../../../utils/index'

const app = getApp ()

Page ({
  data: {
    defaultData: {
      title: '上传作品' // 导航栏标题
    }
  },
  onLoad (options) {
  },
  onPullDownRefresh () {
  },
  // 上传图片
  ChooseImage(e) {
    const that = this
    wx.chooseImage({
      count: 4, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 从相册选择
      success: (res) => {
        that.setData({
          fileList: that.data.fileList.concat(res.tempFilePaths.map((x) => {
            return {
              type: "img",
              name: x,
              path: x
            }
          })),
          uploadFlag: false
        })
        that.triggerEvent('changeFile', {
          value: that.data.fileList,
          key: that.data.fileBoxName
        })
      }
    });
  },

  // 查看图片
  ViewImage (e) {
    const that = this
    const imgArr = that.data.fileList.filter((x)=>{return x.type =="img"}).map(x=>x.path)
    wx.previewImage({
      urls: imgArr,
      current: e.currentTarget.dataset.url
    });
  },
  // 删除图片
  DelImg (e) {
    const that = this
    wx.showModal({
      title: '提示',
      content: '是否删除照片',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm == 1) {
          that.data.fileList.splice(e.currentTarget.dataset.index, 1);
          that.setData({
            fileList: that.data.fileList
          })
        }
      },
    })
  }
});
