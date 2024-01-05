import { get } from '../../../utils/index'
import { uploadUrlHost,defaultAvatar } from '../../../utils/constants'
const app = getApp ()

Page ({
  data: {
    dataSource: {},
    defaultData: {
      title: '课程详情', // 导航栏标题
      noBgColor: true,
      hideShare: true,
      type: 3
      // isWhite: true
    },
    uploadUrlHost: uploadUrlHost,
    type: 1,
    id: '',
    defaultAvatar: defaultAvatar
  },
  onLoad (options) {
    const { id } = options
    this.setData({ id })
    this.handleGetList()
  },
  onPullDownRefresh () {
    this.handleGetList()
  },
  handleGetList () {
    const { id } = this.data
    get('/store_manager/course_offline_plan_detail', {
      id
    }, {
      showLoading: true
    }).then(({ data }) => {
      this.setData({
        dataSource: data,
      })
    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
})
