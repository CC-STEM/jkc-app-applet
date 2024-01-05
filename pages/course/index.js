import dayjs from "dayjs";
import { get, post } from '../../utils/index'
import { uploadUrlHost } from '../../utils/constants'

const app = getApp ()

Page ({
  data: {
    statusOptions: [{ key: 2, value: '全部教程' }, { key: 0, value: '待学习' }, { key: 1, value: '已学习' }],
    status: 0,
    page: 1,
    dataSource: [],
    total: 0,
    defaultData: {
      showTab: true,
      activeTab: 0,
      hideShare: true,
      tabs: [{ key: 1, value: '教程学习' }, { key: 2, value: '线下约课' }]
    },
    isChoose: false,
    uploadUrlHost: uploadUrlHost,
    category: null,
    suitAge: null,
    showCate: false,
    showPrice: false,
    type: 0, // 0 删除课程 1 取消
    rangeArr: ['删除课程', '取消']
  },
  // onLoad (options) {
  //   this.getCollectList()
  // },
  onShow () {
    this.getCollectList()
    // 自定义tabbar需添加初始化代码
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1,
        showListIndex: app.globalData.tabBarList
      })
    }
  },
  handleChangeTab ({ detail }) {
    this.setData({ status: detail.index, page: 1 })
    this.getCollectList()
  },
  onChangeTab ({ detail }) {
    if (detail.index === 0) return
    wx.navigateTo({
      url: '/pages/offcourse/list/index'
    })
  },
  onPullDownRefresh () {
    this.getCollectList()
  },
  onReachBottom () {
    if (this.data.dataSource.length >= this.data.total) return
    this.setData({ page: this.data.page + 1 })
    if (this.data.isChoose) {
      this.getCollectList()
    } else {
      this.handleGetList()
    }
  },
  getCollectList () {
    const { statusOptions, status } = this.data
    get('/online_course/collect_list', {
      study_status: statusOptions[status].key,
      page: this.data.page,
      page_size: 10
    }, {
      showLoading: true
    })
      .then(({ data }) => {
        const newDataSource = this.data.page === 1 ? data.list : this.data.dataSource.concat(data.list)
        this.setData({
          dataSource: newDataSource
        })

        if (status == 0) {
          this.setData({
            isChoose: !!newDataSource.length
          })
        }

        if (status == 0 && !newDataSource.length) {
          this.handleGetList()
        }

        if (this.data.page === 1) {
          wx.pageScrollTo({ scrollTop: 0 })
        }
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  handleGetList () {
    const { category, suitAge } = this.data

    const params = {
      page: this.data.page,
      page_size: 10
    }
    if (category) {
      params.course_category_id = category
    }
    if (suitAge) {
      params.suit_age = suitAge
    }
    get('/online_course/list', params)
      .then(({ data }) => {
        const newDataSource = this.data.page === 1 ? data.list : this.data.dataSource.concat(data.list)
        this.setData({
          dataSource: newDataSource
        })
        if (this.data.page === 1) {
          wx.pageScrollTo({ scrollTop: 0 })
        }
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onShowModal () {
    this.getTabBar().setData({ isHidden: true })
    this.setData({ showCate: true })
  },
  onCancel () {
    this.setData({ showCate: false })
    this.getTabBar().setData({ isHidden: false })
  },
  onOk ({ detail }) {
    this.setData({ [detail.type]: detail.value, showCate: false })
    this.getTabBar().setData({ isHidden: false })
    this.handleGetList()
  },
  handleChangeData ({ currentTarget, detail }) {
    const field = currentTarget.dataset && currentTarget.dataset.field
    this.getTabBar().setData({ isHidden: false })

    if (field) {
      this.setData({ type: detail.value })
    }
    if (detail.value === 0) {
      post('/online_course/del_collect', {
        id: currentTarget.dataset.id
      })
        .then(({ data }) => {
          this.getCollectList()
        })
    }
  }
})
