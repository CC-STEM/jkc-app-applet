Component ({
  properties: {
    lineImg: {
      type: String,
      value: 'about-line.png'
    },
    tabs: {
      type: Array // [{value: '分类', prop: data}, ...]
    },
    activeTab: {
      type: Number,
      value: 0
    },
    textLeft: {
      type: Boolean,
      value: false
    },
    noBg: {
      type: Boolean,
      value: false
    },
    class: {
      type: String,
      value: ''
    }
  },
  data: {},
  methods: {
    _handleClick ({ currentTarget }) {
      const index = currentTarget.dataset.index
      if (this.data.activeTab === index) return
      this.triggerEvent('change', {
        index,
        tab: this.data.tabs[index]
      })
    }
  }
})
