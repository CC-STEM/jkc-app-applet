import { ageMap } from '../../utils/constants'

Component ({
  data: {
    list: ageMap,
    selectedArr: [[0], [0]],
    _show: false
  },
  methods: {
    _handleChange ({ detail }) {
      this.setData({
        selectedArr: [...detail.value]
      })
    },
    _handleOk () {
      const { list, selectedArr } = this.data
      this.setData({ _show: false })
      this.triggerEvent('ok', {
        type: 'suitAge',
        value: `${list[selectedArr[0]].value}-${list[selectedArr[1]].value}`
      })
    },
    _handleCancel () {
      this.setData({ _show: false })
      this.triggerEvent('cancel')
    },
    _handleShow () {
      this.setData({ _show: true })
    },
    _handleStopPropagation () {

    }
  }
})
