// components/calendar/calendar.js
import { weekObj } from '../../utils/constants'
const dayjs = require('./dayjs')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 底下需要展示小圆点的日期数组
    spot: {
      type: Array, // ['2022-05-06'],
      value: []
    },
    // 组件渲染时默认选中的时间
    defaultDate: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    dateList: [], // 日历主体渲染数组
    selectDay: {} // 选中时间
  },
  // 组件生命周期
  lifetimes: {
    attached () {
      const spot = this.data.spot
      const now = this.data.defaultDate ? dayjs(this.data.defaultDate) : dayjs(spot[0])
      this.setDate(now.year(), now.month() + 1, now.date())
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 设置选中日期
    setDate (paramYear, paramMonth, paramDate) {
      const date = Math.min(dayjs(`${paramYear}-${paramMonth}`).daysInMonth(), this.data.selectDay.date)
      const time = dayjs(`${paramYear}-${paramMonth}-${paramDate || date}`)
      const selectDay = {
        year: paramYear,
        month: paramMonth,
        date: paramDate || date,
        dateString: time.format('YYYY-MM-DD')
      }
      // 设置收起时的日历主体偏移量
      const dateListStart = dayjs(`${paramYear}-${paramMonth}`).day(0)
      this.setData({
        transform: dayjs(`${paramYear}-${paramMonth}-${paramDate || date}`).day(0).diff(dateListStart, 'week')
      })
      if (paramYear !== this.data.selectDay.year) {
        this.setData({
          selectDay
        })
        this.dateListInit(paramYear, paramMonth)
        this.triggerEvent('dateChange', this.data.selectDay)
        this.triggerEvent('monthChange', this.data.selectDay)
        this.triggerEvent('yearChange', this.data.selectDay)
        return
      }
      if (paramMonth !== this.data.selectDay.month) {
        this.setData({
          selectDay
        })
        this.dateListInit(paramYear, paramMonth)
        this.triggerEvent('dateChange', this.data.selectDay)
        this.triggerEvent('monthChange', this.data.selectDay)
        return
      }
      if (paramDate && paramDate !== this.data.selectDay.date) {
        this.setData({
          selectDay
        })
        this.triggerEvent('dateChange', this.data.selectDay)
      }
    },
    // 日历主体的渲染方法
    dateListInit (paramYear = this.data.selectDay.year, paramMonth = this.data.selectDay.month) {
      const spot = this.data.spot
      const dateList = [] // 需要遍历的日历数组数据
      let startDate = dayjs(spot[0]) // 日历渲染开始日期
      const endDate = dayjs(spot[spot.length - 1]) // 日历主体渲染结束日期
      const timeArr = this.data.spot.map(item => dayjs(item).format('YYYY-MM-DD')) // 由课程的日期
      const today = `${dayjs().year()}-${dayjs().month() + 1}-${dayjs().date()}}`
      const tomorrow = dayjs(today).add(1, 'day').format('YYYY-MM-DD')

      while (startDate <= endDate) {
        const dateString = startDate.format('YYYY-MM-DD')
        dateList.push({
          date: startDate.date() < 10 ? Number(`0${startDate.date()}`) : startDate.date(),
          month: startDate.month() + 1 < 10 ? Number(`0${startDate.month() + 1}`) : startDate.month() + 1,
          year: startDate.year(),
          week: dateString == today ? '今日' : dateString == tomorrow ? '明日' : weekObj[startDate.day()],
          dateString,
          spot: timeArr.indexOf(dateString) !== -1,
          isOver: timeArr.indexOf(dateString) !== -1 ? dayjs(dateString).valueOf() < dayjs().subtract(1, 'days').valueOf() : false
        })
        startDate = startDate.add(1, 'day')
      }
      this.setData({
        dateList: dateList
      })
    },
    // 某一天被点击时
    selectChange (e) {
      const spot = e.currentTarget.dataset.spot
      const year = e.currentTarget.dataset.year
      const month = e.currentTarget.dataset.month
      const date = e.currentTarget.dataset.date
      if (!spot) return
      this.setDate(year, month, date)
    }
  },
  // 监听参数变化
  observers: {
    spot () {
      this.dateListInit()
    }
  }
})
