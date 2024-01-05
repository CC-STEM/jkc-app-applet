/**
 * 单选picker
 */
Component ({
  properties: {
    range: { // 选项
      type: Array
    },
    value: { // 表示选择了 range 中的第几个（下标从 0 开始）
      type: Number
    },
    rangeKey: { // 当 range 是一个 Object Array 时，通过 range-key 来指定 Object 中 key 的值作为选择器显示内容
      type: String
    }
  },
  data: {
    _value: 0,
    _show: false
  },
  lifetimes: {
    attached () {
      this.setData({ _value: this.data.value })
    }
  },
  methods: {
    _handleChange ({ detail }) {
      this.setData({ _value: detail.value[0] })
    },
    _handleOk () {
      this.setData({ _show: false })

      this.triggerEvent('ok', { value: this.data._value })
    },
    _handleStopPropagation () {

    },
    _handleCancel () {
      this.setData({ _show: false, _value: this.data.value })
      this.triggerEvent('cancel')
      this.getTabBar() && this.getTabBar().setData({ isHidden: false })
    },
    _handleShow () {
      this.setData({ _show: true })
      this.getTabBar() && this.getTabBar().setData({ isHidden: true })
    }
  }
})
