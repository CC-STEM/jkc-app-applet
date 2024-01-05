// DatePicker.js
const date = new Date();   
var currentYears=date.getFullYear();
var currentMonths=date.getMonth()+1;
var currentDay=date.getDate();
var currentHours=date.getHours();
var currentMinute=date.getMinutes(); 

const formatNumber = n => {

  // formatNumber中获取到n为时间，将它字符串转换，然后检查这个字符串是单是双，
  // 由n[1]就可以判断单双，因为如果是单只有n[0]，如果是双就是n[0][1]。所以判断出单双后，如果是单添加一个0到数字前方，如果是双则直接返回。
  
  n = n.toString()
  return n[1] ? n : '0' + n
}


function getCurrentDate(){
    // 获取当前时间   
    var mm=[currentMonths].map(formatNumber)
    var dd=[currentDay].map(formatNumber)
    var hh=[currentHours].map(formatNumber)
    var min=[currentMinute].map(formatNumber) 
    // console.log(currentYears+'年'+mm+'月'+dd+'日'+hh+':'+min)
    return currentYears+'年'+mm+'月'+dd+'日'+hh+':'+min;
}

function GetMultiIndex(){
  //一点开picker的选中设置
  // [0,currentMonths-1,currentDay-1,currentHours,currentMinute]
  return  [0,currentMonths-1,currentDay-1,currentHours,currentMinute]
} 
function loadPickerData(){
  // picker控件初始化
  const years = []; const months = []; const days = []; const hours = []; const minutes = [];
  
  //获取年（现在自定义只有两个年份，自行修改）
  
  for (let i = currentYears; i <= date.getFullYear() + 1; i++) {
    years.push("" + i+"年");
  }
  
  //获取月份
  for (let i = 1; i <= 12; i++) {
    if (i < 10) {
      i = "0" + i;
    }
    months.push("" + i+"月");
  }
  
  //获取日期
  for (let i = 1; i <= 31; i++) {
    if (i < 10) {
      i = "0" + i;
    }
    days.push(""+ i+"日");
  }
  
  //获取小时
  for (let i = 0; i < 24; i++) {
    // if (i < 10) {
    //   i = "0" + i;
    // }
    hours.push("" + i+"时");
  }
  
  //获取分钟
  for (let i = 0; i < 60; i++) {
    if (i < 10) {
      i = "0" + i;
    }
    minutes.push("" + i+"分");
  } 
  return [years, months, days, hours, minutes]
}


module.exports = {
  loadPickerData:loadPickerData,
  getCurrentDate:getCurrentDate,
  GetMultiIndex:GetMultiIndex
}

