import { get, post } from '../../utils/index'
import { ageObj } from '../../utils/constants'

const app = getApp()

Component ({
  properties: {
    // defaultData（父页面传递的数据-就是引用组件的页面）
    defaultData: {
      type: Object,
      value: {
        title: '我是默认标题',
        show: false,
        memberLocation: '',
        hideShare: false,
      },
      observer: function (newVal, oldVal) {}
    }
  },
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    navBarHeight: app.globalData.navBarHeight,
    menuRight: app.globalData.menuRight,
    menuTop: app.globalData.menuTop,
    menuHeight: app.globalData.menuHeight,
    navBarAndStatusBarHeight: app.globalData.statusBarHeight + app.globalData.navBarHeight,
    show: false,
    age: null,
    ageName: ''
  },
  lifetimes: {
    attached () {
      if (!app.globalData.userInfo.age) {
        this.getUserInfo()
      } else {
        this.setData({
          age: app.globalData.userInfo.age,
          ageName: ageObj[app.globalData.userInfo.age]
        })
      }
    }
  },
  methods: {
    getUserInfo (age) {
      get('/member/info').then(({ data }) => {
        app.globalData.userInfo = {
          ...app.globalData.userInfo,
          age: data.age
        }
        this.setData({
          age: Number(data.age),
          agzeName: ageObj[Number(data.age)]
        })
      })
    },
    onShowModal () {
      // 隐藏tabbar
      this.getTabBar().setData({ isHidden: true })
      this.setData({
        show: true
      })
    },
    onCancel () {
      this.setData({ show: false })
      this.getTabBar().setData({ isHidden: false })
    },
    onOk ({ detail }) {
      this.setData({ age: Number(detail.age), ageName: ageObj[detail.age] })
      this.getTabBar().setData({ isHidden: false })

      post('/member/set_age', {
        age: detail.age
      })
        .then(res => {
          this.onCancel()
        })
    }
  }
})
