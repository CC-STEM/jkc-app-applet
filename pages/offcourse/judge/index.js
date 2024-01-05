import dayjs from 'dayjs'
import { get, post } from '../../../utils/index'
import { uploadUrlHost, defaultAvatar } from '../../../utils/constants'

Page({
  data: {
    page: 1,
    dataSource: { },
    total: 0,
    defaultData: {
      title: '评价老师', // 导航栏标题
      noBgColor: true,
      type: 3,
      hideShare: true
    },
    uploadUrlHost: uploadUrlHost,
    desc: '',
    defaultAvatar: defaultAvatar,
    star: [1, 2, 3, 4, 5],
    starIndex: 0,
    tags: [{name: '专业性强'}, {name: '课程内容丰富'}, {name: '趣味性'}, {name: '上课氛围好'}, {name: '责任心强'}, {name: '孩子喜欢'}, {name: '细心'}, {name: '耐心'}, {name: '热心'}, {name: '关注每个孩子'}, {name: '善于引导'}],
    selectTag: [],
    details: {},
    id: '',
    teacherName: '',
    isSet: false
  },
  onLoad (options) {
    if (options.id) {
      this.setData({ id: options.id, teacherName: options.teacherName, isSet: options.status == 2 })
      this.getDetails()
    }
  },
  onPullDownRefresh () {
    this.getDetails()
  },
  onSelect ({ currentTarget }) {
    console.log('>>onSelect', currentTarget.dataset.index)
    this.setData({ starIndex: currentTarget.dataset.index + 1 }) // desc
  },
  onSelectTag ({ currentTarget }) {
    if (this.data.isSet) return
    const _selectTag = this.data.selectTag
    const _tags = this.data.tags
    const { tag, index } = currentTarget.dataset
    const i = _selectTag.indexOf(tag)
    if (i > -1) {
      _selectTag.splice(i, 1)
      _tags[index] = {
        ..._tags[index],
        isSelect: false
      }
    } else {
      _selectTag.push(tag)
      _tags[index] = {
        ..._tags[index],
        isSelect: true
      }
    }
    console.log('>>onSelect', _selectTag, _tags)
    this.setData({ selectTag: _selectTag, tags: [..._tags] })
  },
  handleChangeData ({ currentTarget, detail }) {
    if (this.data.isSet) return

    const field = currentTarget.dataset && currentTarget.dataset.field
    if (field) {
      this.setData({ [field]: detail.value }) // desc
    }
  },
  getDetails () {
    const { tags } = this.data
    get('/offline_course_evaluation/detail', {
      course_offline_order_id: this.data.id
    })
      .then(({ data }) => {
        if (!data) {
          this.setData({ isSet: false })
          return
        }
        const selectTag = data.tag_text.split(',')
        tags.forEach(item => {
          selectTag.forEach(tag => {
            if (tag == item.name) {
              item.isSelect = true
            }
          })
        })
        this.setData({ 
          starIndex: data.grade,
          selectTag,
          tags: [...tags],
          desc: data.remark,
          isSet: true
        })
      })
  },
  onSubmit () {
    const { id, starIndex, desc, selectTag } = this.data
    if (!starIndex) {
      wx.showToast({
        title: '请对课程进行评价',
        icon: 'none'
      })
      return
    }
    post('/offline_course_evaluation/add', {
      course_offline_order_id: id,
      grade: starIndex,
      tag_text: selectTag,
      remark: desc
    })
      .then(res => {
        wx.navigateBack({
          delta: 1,
          fail (res) {
            wx.reLaunch({
              url: '/pages/offcourse/feedback/index'
            })
          }
        })
      })
  },
})
