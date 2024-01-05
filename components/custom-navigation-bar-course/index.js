import { uploadUrlHost } from '../../utils/constants'

const app = getApp()

Component ({
  properties: {
    // defaultData（父页面传递的数据-就是引用组件的页面）
    defaultData: {
      type: Object,
      value: {
        hideShare: false,
        showTab: true,
        activeTab: {
          type: Number,
          value: 0
        },
        noLectureCount: 0,
        lecturedCount: 0,
        teacher_name: '',
        teacher_avatar: ''
      }
    }
  },
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    navBarHeight: app.globalData.navBarHeight,
    menuRight: app.globalData.menuRight,
    menuTop: app.globalData.menuTop,
    menuHeight: app.globalData.menuHeight,
    navBarAndStatusBarHeight: app.globalData.statusBarHeight + app.globalData.navBarHeight,
    tabs: [{ key: 0, value: '待上课' }, { key: 1, value: '已上课' }],
    uploadUrlHost: uploadUrlHost
  },
  methods: {
    handleClick ({ currentTarget }) {
      const index = currentTarget.dataset.index
      if (this.data.activeTab === index) return
      this.triggerEvent('change', {
        index,
        tab: this.data.tabs[index]
      })
    }
  }
})
