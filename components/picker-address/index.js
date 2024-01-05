import { areaMap } from '../../utils/constants'

function getInitData (list, index1, index2) {
  if (!list || !list.length) return

  return [
    list,
    list[index1].children,
    list[index1].children[index2].children
  ]
}

Component ({
  properties: {
    value: {
      type: Array,
      value: [0, 0, 0]
    },
    type: {
      type: String,
      value: 'dateTime' // 可选 time 模式
    }
  },
  data: {
    // dateTimeOptions,
    list: [],
    selectedArr: [0, 0, 0],
    provinceNames: [],
    cityNames: [],
    districtNames: [],
    _show: false
  },
  lifetimes: {
    attached () {
      const arr = areaMap[1].map(p => ({
        label: p.name,
        value: p.id,
        children: areaMap[p.id].map(c => ({
          label: c.name,
          value: c.id,
          children: areaMap[c.id].map(q => ({
            label: q.name,
            value: q.id
          }))
        }))
      }))
      this.setData({
        list: arr
      })
      this.getNeedSelectData(arr)
      // 在组件实例进入页面节点树时执行
    }
  },
  methods: {
    _handleChange ({ detail }) {
      const { selectedArr } = this.data
      const index1 = detail.value[0]
      let index2 = detail.value[1]
      let index3 = detail.value[2]
      if (detail.value[0] != selectedArr[0]) {
        index2 = 0
        index3 = 0
      } else if (detail.value[1] != selectedArr[1]) {
        index3 = 0
      }

      const _arr = getInitData(this.data.list, index1, index2)

      this.setData({
        provinceNames: _arr[0],
        cityNames: _arr[1],
        districtNames: _arr[2],
        selectedArr: [index1, index2, index3]
      })
    },
    getNeedSelectData (list) {
      const { value } = this.data
      let _selectedArr = []

      if (value.length) {
        list.forEach((item, index) => {
          if (item.value === value[0]) {
            _selectedArr[0] = index
            item.children.forEach((item1, index1) => {
              if (item1.value === value[1]) {
                _selectedArr[1] = index1
                item1.children.forEach((item2, index2) => {
                  if (item2.value === value[2]) {
                    _selectedArr[2] = index2
                  }
                })
              }
            })
          }
        })
      } else {
        _selectedArr = [0, 0, 0]
      }

      const _arr = getInitData(list, _selectedArr[0], _selectedArr[1])

      this.setData({
        selectedArr: [..._selectedArr],
        provinceNames: _arr[0],
        cityNames: _arr[1],
        districtNames: _arr[2]
      })
    },
    _handleOk () {
      const { provinceNames, cityNames, districtNames, selectedArr } = this.data
      this.setData({ _show: false })
      this.triggerEvent('ok', {
        value: [
          provinceNames[selectedArr[0]].value,
          cityNames[selectedArr[1]].value,
          districtNames[selectedArr[2]].value
        ],
        name: [
          provinceNames[selectedArr[0]].label,
          cityNames[selectedArr[1]].label,
          districtNames[selectedArr[2]].label
        ]
      })
    },
    _handleStopPropagation () {

    },
    _handleCancel () {
      this.setData({ _show: false })
      this.triggerEvent('cancel')
    },
    _handleShow () {
      this.setData({ _show: true })
    }
  },
  // observers: {
  //   value (value) {
  //     this.setData({ list: getInitData(this.data.list) })
  //   }
  // }
})
