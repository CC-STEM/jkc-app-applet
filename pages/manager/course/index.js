import { get } from '../../../utils/index'
import { uploadUrlHost } from '../../../utils/constants'

Page ({
  data: {
    dataSource: [],
    defaultData: {
      showTab: true,
      activeTab: 0,
      hideShare: true,
      noBgColor: true,
      showNum: true,
      tabs: [{ key: 0, value: '待上课' }, { key: 1, value: '已上课' }]
    },
    uploadUrlHost: uploadUrlHost,
    status: 0,
    id: null
  },
  onLoad (options) {
    options.id && this.setData({
      id: options.id
    })

    if (options.status) {
      this.setData({
        defaultData: {
          ...this.data.defaultData,
          activeTab: Number(options.status)
        }
      })
    }
   
    console.log('>>options', options)
    if (options.num1 || options.num2) {
      this.setData({
        defaultData: {
          ...this.data.defaultData,
          num1: options.num1,
          num2: options.num2,
        }
      })
    }
   
    this.handleGetList()
  },
  onPullDownRefresh () {
    this.handleGetList()
  },
  handleGetList () {
    get('/store_manager/member_course_offline_order', { 
      status: this.data.defaultData.activeTab,
      id: this.data.id
    }, {
      showLoading: true
    }).then(({ data }) => {
      this.setData({
        dataSource: data.list
      })
    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },
  onChangeType ({ currentTarget }) {
    const index = currentTarget.dataset.index + 1
    if (this.data.type === index) return
    this.setData({
      type: index
    })
    this.handleGetList()
  },
  onCopy ({ currentTarget }) {
    const number = currentTarget.dataset.number
    wx.setClipboardData({ data: number })
  },
  onChangeTab ({ detail }) {
    const { defaultData } = this.data
    this.setData({
      defaultData: {
        ...defaultData,
        activeTab: detail.index
      }
    })
    this.handleGetList()
  }
})
