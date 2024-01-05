const app = getApp ()

Component ({
  data: {
    selected: 0,
    color: '#BFBFBF',
    selectedColor: '#333333',
    showListIndex: app.globalData.tabBarList,
    isHidden: false,
    list: [
      {
        "pagePath": "/pages/index/index",
        "text": "推荐",
        "iconPath": "/images/tab-recommend.png",
        "selectedIconPath": "/images/tab-recommend-selected.png"
      },
      {
        "pagePath": "/pages/offcourse/index",
        "text": "线下约课",
        "iconPath": "/images/tab-course.png",
        "selectedIconPath": "/images/tab-course-selected.png"
      },
      {
        "pagePath": "/pages/my/index",
        "text": "我的",
        "iconPath": "/images/tab-my.png",
        "selectedIconPath": "/images/tab-my-selected.png"
      }
    ],
  },
  attached () { },
 
  ready:function(){
    this.setData({
      selected: app.globalData.selectedIndex
    })
  },
  methods: {
    switchTab (e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
      wx.navigateTo({ url })
      app.globalData.selectedIndex = data.index
      this.setData({
        selected: data.index
      })
    }
  }
})
