import { get } from '../../utils/index'
import dayjs from 'dayjs'
import { typeObj } from '../../utils/constants'

function getNeedDate (str) {
  return dayjs(str).format('MM.DD')
}

Component ({
  properties: {
    show: {
      type: Boolean,
      value: false
    }, // 这里定义了modalHidden属性，属性值可以在组件使用时指定.写法为modal-hidden
    defaultData: {
      type: Object,
      value: {}
    }
  },
  /**
  * 页面的初始数据
  */
  data: {
    dataSource: [],
    animationData: {},
    typeObj: typeObj,
    selectedList: [], // 所选课程id
    batchNoList: [], // 所选课程batch_no
    themeType: 1 // 课程分类
  },
  lifetimes: {
    attached () {
      this.handleGetList()
    }
  },
  methods: {
    handleGetList () {
      get('/offline_course/batch_reservation_detail', {
        course_offline_id: this.data.defaultData.course_offline_id,
        physical_store_id: this.data.defaultData.physical_store_id
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
            dataSource: dataSource,
            showReverse: true
          })
        })
    },
    onSubmit () {
      const { selectedList, batchNoList, themeType } = this.data
      if (!selectedList.length) return
      this.triggerEvent('ok', {
        selectedList,
        batchNoList,
        themeType
      })
    },
    onSelect ({ currentTarget }) {
      let _selectedList = this.data.selectedList || []
      let _batchNoList = this.data.batchNoList || []

      const dataSource = this.data.dataSource
      const { id, index, batchno, themetype } = currentTarget.dataset
      if (_selectedList.includes(id)) {
        _selectedList = _selectedList.filter(item => item !== id)
        _batchNoList = _batchNoList.filter(item => item !== batchno)
      } else {
        _selectedList.push(id)
        _batchNoList.push(batchno)
      }
      dataSource[index] = {
        ...dataSource[index],
        isChecked: _selectedList.includes(id)
      }

      this.setData({
        selectedList: _selectedList,
        batchNoList: _batchNoList,
        dataSource: [...dataSource],
        themeType: themetype
      })
    },
    // 取消
    mCancel () {
      this.hideModal()
    },
    // 隐藏遮罩层
    hideModal () {
      this.triggerEvent('cancel', false)
      const that = this
      const animation = wx.createAnimation({
        duration: 400, // 动画的持续时间 默认400ms
        timingFunction: 'ease' // 动画的效果 默认值是linear
      })
      this.animation = animation
      that.slideDown() // 调用动画--滑出
      let time1 = setTimeout(function () {
        that.setData({
          show: false
        })
        clearTimeout(time1)
        time1 = null
      }, 220) // 先执行下滑动画，再隐藏模块
    },
    // 动画 -- 滑入
    slideIn () {
      this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
      this.setData({
        //  动画实例的export方法导出动画数据传递给组件的animation属性
        animationData: this.animation.export()
      })
    },
    // 动画 -- 滑出
    slideDown () {
      this.animation.translateY(2000).step()
      this.setData({
        animationData: this.animation.export()
      })
    }
  }
})
