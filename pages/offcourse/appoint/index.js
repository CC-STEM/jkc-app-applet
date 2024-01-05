import dayjs from "dayjs"
import { get, post } from '../../../utils/index'

const app = getApp()

function getNeedDate (str) {
  return dayjs(str).format('MM月DD日')
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateString: '',
    spot: [],
    kw: null,
    status: 1,
    page: 1,
    dataSource: [],
    total: 0,
    buttons: [
      { text: '取消' },
      { text: '确认' }
    ],
    defaultData: {
      title: '上课时间'
    },
    isChoose: true,
    vipMap: [
      { title: '经典月卡', coin: '1000', money: '99' },
      { title: '钻石季卡', coin: '5000', money: '490' },
      { title: '黑金年卡', coin: '15000', money: '1490' }
    ],
    tagList: [{ key: 0, value: '0-2' }, { key: 1, value: '2-3' }, { key: 2, value: '4-5' }],
    selectedList: []
  },
  dateChange (e) {
    this.setData({
      dateString: e.detail.dateString
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    const { batchNo, categoryId, courseType } = options
    this.setData({ batchNo, categoryId, courseType })
    this.handleGetList()
  },

  handleGetList () {
    get('/offline_course/batch_reservation_detail', {
      course_category_id: this.data.categoryId,
      // date: '2022-10-09',
      date: this.data.dateString,
      batch_no: this.data.batchNo
    })
      .then(({ data }) => {
        if (!data.list || !data.list.length) return
        const dataSource = data.list.map(item => ({
          ...item,
          start_time: item.class_time.split(' ')[1],
          end_time: item.class_time.split(' ')[3],
          date: getNeedDate(item.class_time.split(' ')[0])
        }))
        this.setData({
          dataSource: dataSource
        })
      })
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },
  onSubmit () {
    const { batchNo, courseType, dataSource, selectedList } = this.data
    if (!selectedList.length) return
    wx.navigateTo({ url: `/pages/offcourse/order/index?batchNo=${batchNo}&ids=${JSON.stringify(selectedList)}&type=${courseType}` })
  },
  handleChangeTab ({ detail }) {
    this.setData({ status: detail.index, page: 1 })
    // this.handleGetList()
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
  },
  onCall () {
    wx.makePhoneCall({
      phoneNumber: '13339927553 ' // 仅为示例，并非真实的电话号码
    })
  },
  onSelect ({ currentTarget }) {
    let _selectedList = this.data.selectedList || []
    const dataSource = this.data.dataSource
    const { id, index } = currentTarget.dataset
    if (_selectedList.includes(id)) {
      _selectedList = _selectedList.filter(item => item !== id)
    } else {
      _selectedList.push(id)
    }
    dataSource[index] = {
      ...dataSource[index],
      isChecked: _selectedList.includes(id)
    }

    this.setData({
      selectedList: _selectedList,
      dataSource: [...dataSource]
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload () {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom () {

  }
})
