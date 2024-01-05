import dayjs from 'dayjs'
import './zh-cn'

dayjs.locale('zh-cn')

function getNeedNum (num) {
  // if (num > 0) {
  //   return Number(num)
  // }
  return Number(num)
}

function getOption (data = [], labelData = {}, isHideLegend = false) {
  var option = {
    legend: !!isHideLegend ? null : {
      z: 2,
      top: 'bottom',
      itemWidth: 13,
      itemHeight: 13,
      fontSize: 12,
      color: "#666666"
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    series: [
      {
        name: 'Nightingale Chart',
        type: 'pie',
        radius: ['40%', '70%'],
        itemStyle: {
          normal: {
            color: function (colors) {
               var colorList = [
                  '#26BAF7',
                  '#FEB021',
                  '#FA3D37',
                  '#1CC45E'
                ];
              return colorList[colors.dataIndex];
            }
          },
        },
        minAngle: 0,
        label: {
          show: true,
          position: 'center',
          formatter:function (argument) {
              var html;
              html = `${labelData.value1}\r\n\r\n会员人数`;
              if (isHideLegend) {
                html = `${labelData.rate}%\r\n\r\n${labelData.value1}/${labelData.value2}`;
              }
              return html;
          },
          textStyle:{
              fontSize: 14,
              fontWeight: 'bold',
              color:'#1A1A1A'
          }
        },
        data: data
      }
    ]
  };
  return option;
}

function getUrl (url, query) {
  let _url = url
  const _q = []
  if (query) {
    _url += '?'
    Object.keys(query)
      .forEach(key => {
        let value = query[key]
        if (value === null || typeof value === 'undefined') {
          value = ''
        }
        _q.push(`${key}=${value}`)
      })
  }
  return _url + _q.join('&')
}

const accountInfo = wx.getAccountInfoSync()
const envVersion = accountInfo.miniProgram.envVersion

const baseUrl = envVersion === 'release' ? 'https://jkcspace.com/api' : 'https://test.jkcspace.com/api'

let token = wx.getStorageSync('TOKEN')

function get (path, params = {}, config = {}) {
  const { silent, showLoading, baseUrl: _baseUrl } = config
  // console.log('>>get', path, params)
  return new Promise((resolve, reject) => {
    // if (!token) {
    //   setTimeout(() => {
    //     get(path, params, config)
    //       .then(res => resolve(res))
    //       .catch(err => reject(err))
    //   }, 1000)
    // } else {
      showLoading && wx.showLoading({ title: '加载中...' })
      wx.request({
        url: getUrl((_baseUrl || baseUrl) + path, {
          ...params
          // --------------------
          // timestamp: Date.now()
        }),
        header: {
          authorization: token
        },
        success ({ data }) {
          console.log('request response::::::::', path, params, data)
          if (data.code) {
            if (data.code === 401) {
              wx.navigateTo({ url: '/pages/auth/index' })
              reject(data)
              return
            }
            if (!silent) {
              wx.showToast({ title: data.msg, icon: 'none' })
            }
            reject(data)
          }
          resolve(data)
        },
        fail (err) {
          // 请求出错 / 超时
          console.error(err)
          if (err.errMsg.includes('timeout')) {
            wx.showToast({ title: '您当前的网络环境不稳定，请稍后重试', icon: 'none' })
          }
        },
        complete () {
          showLoading && wx.hideLoading()
        }
      })
    // }
  })
}

function post (path, params, config = {}) {
  const { silent, showLoading, baseUrl: _baseUrl, json } = config
  console.log('>>post', path, params)
  return new Promise((resolve, reject) => {
    // if (!token && path !== '/login/wxmini' && path !== '/login/get_mobile') {
    //   setTimeout(() => {
    //     post(path, params, config)
    //       .then(res => resolve(res))
    //       .catch(err => reject(err))
    //   }, 1000)
    // } else {
      showLoading && wx.showLoading({ title: '加载中...' })
      wx.request({
        url: getUrl((_baseUrl || baseUrl) + path, {
          // post请求提取部分公共参数放在url上
          // plan_id: params.plan_id,
          // room_wxid: params.room_wxid,
          // user_id: params.user_id,
          // sub_user_id: params.sub_user_id,
          // // ----------------------------
          // fan_id: token,
          // timestamp: Date.now()
        }),
        method: 'POST',
        header: {
          authorization: token,
          'Content-Type': json ? 'application/json' : 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest'
        },
        data: params,
        success ({ data }) {
          console.log('request response::::::::', path, params, data)
          if (data.code) {
            if (data.code === 401) {
              wx.navigateTo({ url: '/pages/auth/index' })
              reject(data)
              return
            }
            if (!silent) {
              wx.showToast({ title: data.msg, icon: 'none' })
            }
            reject(data)
          }
          resolve(data)
        },
        fail (err) {
          // 请求出错 / 超时
          console.error(err)
          if (err.errMsg.includes('timeout')) {
            wx.showToast({ title: '您当前的网络环境不稳定，请稍后重试', icon: 'none' })
          }
        },
        complete () {
          showLoading && wx.hideLoading()
        }
      })
    // }
  })
}

function upload (params, config = {}) {
  console.log('>>upload', params)
  const { silent, showLoading, baseUrl: _baseUrl, json } = config

  return new Promise((resolve, reject) => {
    if (!token) {
      setTimeout(() => {
        upload(params, config)
          .then(res => resolve(res))
          .catch(err => reject(err))
      }, 1000)
    } else {
      showLoading && wx.showLoading({ title: '上传中...' })
      wx.uploadFile({
        url: getUrl((_baseUrl || baseUrl) + '/upload/cos'),
        filePath: params.filePath,
        name: 'file',
        formData: {
          file: params.filePath
        },
        header: {
          authorization: token
        },
        success ({ data: _data }) {
          const data = JSON.parse(_data)
          console.log('request response::::::::', params, data)
          if (data.code) {
            if (data.code === 401) {
              wx.navigateTo({ url: '/pages/auth/index' })
              reject(data)
              return
            }
            if (!silent) {
              wx.showToast({ title: data.msg, icon: 'none' })
            }
            reject(data)
          }
          resolve(data)
        },
        fail (err) {
          // 请求出错 / 超时
          console.error(err)
          if (err.errMsg.includes('timeout')) {
            wx.showToast({ title: '您当前的网络环境不稳定，请稍后重试', icon: 'none' })
          }
        },
        complete () {
          showLoading && wx.hideLoading()
        }
      })
    }
  })
}

/**
 * 页面用到的时间选项
 * @return {({value: *|string, universal: *|string}[]|{value: string, universal: string}[]|{value: string, universal: string}[])[]}
 */
function dateTimeOptionsGenerator () {
  const dateList = [...Array(60).keys()].map(addDays => {
    const date = dayjs().add(addDays, 'day')
    const obj = {
      value: date.format('M月D日 周dd'), // picker会用到这个
      universal: date.format('YYYY-MM-DD') // 前后端交流通用表达形式
    }

    if (addDays === 0) {
      obj.value = '今天'
    } else if (addDays === 1) {
      obj.value = date.format('M月D日 明天')
    } else if (addDays === 2) {
      obj.value = date.format('M月D日 后天')
    }

    return obj
  })
  const hourList = [...Array(24).keys()].map(hour => ({
    value: `${hour}时`,
    universal: `0${hour}`.slice(-2)
  }))
  const minuteList = [...Array(60).keys()].map(minute => ({
    value: `${minute}分`,
    universal: `0${minute}`.slice(-2)
  }))

  return [dateList, hourList, minuteList]
}

const dateTimeOptions = dateTimeOptionsGenerator()

const getAllParams = (query) => {
  // 获取参数
  // 以&符号分割
  let item = query.split("&");
  let obj = {};
  for (let i = 0; i < item.length; i++) {
    let arr = item[i].split("=");
    // 参数名，参数值 赋值 对象的属性名，属性值
    obj[arr[0]] = arr[1];
  }
  return obj;
}

module.exports = {
  getOption,
  getNeedNum,
  getAllParams,
  envVersion,
  get,
  post,
  upload,
  token,
  getAllParams,
  setToken: (_token) => {
    token = _token
  },
  dateTimeOptionsGenerator,
  dateTimeOptions // 在打开小程序是生成一组时间选项，建议全局使用这组时间选项，picker使用这组时间
}
