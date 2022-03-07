import Shuffle from 'lodash/_arrayShuffle'
const randomValue = function(config={}){
  let configs = Object.assign({
    min:1,
    max:10,
    decimal:0,
    arr:[]
  },config)
  if(configs.arr.length > 0){
    return configs.arr[randomValue({ min:0, max:configs.arr.length - 1 })]
  }
  if(configs.decimal){
    let decimalValue = (Math.random() * ( configs.max - configs.min ) + configs.min).toFixed(configs.decimal)
    return Number(decimalValue)
  }
  return Math.floor(Math.random() * ( configs.max - configs.min + 1 ) + configs.min)
}

const commonDivisor = function(arrs){
  let arr = [...arrs],
  newArr = []
  let gcd = function ac(a, b){
    return a % b === 0 ? b : ac(b, a % b)
  }
  while(arr.length > 1){arr.push(gcd(arr.pop(), arr.pop()))}
  arrs.forEach(item => {
    newArr.push( item / arr[0] )
  })
  return {
    newArr,
    commonDivisor:arr[0]
  }
}

const weightRandom = function(arrConfig,type=false){
  let weightArr = commonDivisor(arrConfig.weight).newArr,
  newArr = []
  arrConfig.value.forEach((item,index) => {
    for(let i=1;i<=weightArr[index];i++){
      newArr.push(item)
    }
    // newArr.fill(item.value,newArr.length,newArr.length+newWeightArr[index]-1)
  })
  newArr = Shuffle(newArr)
  if(type){
    return randomValue({ arr:newArr })
  }else{
    return newArr
  }
}

/**
 ** 得到浏览器每秒帧数fps
 **
 ** @Date Mar 13 2013
 **/
/*
const showFPS = (function() {
  var requestAnimationFrame =
    window.requestAnimationFrame || //Chromium
    window.webkitRequestAnimationFrame || //Webkit
    window.mozRequestAnimationFrame || //Mozilla Geko
    window.oRequestAnimationFrame || //Opera Presto
    window.msRequestAnimationFrame || //IE Trident?
    function(callback) {
      //Fallback function
      window.setTimeout(callback, 1000 / 60)
    }
  var e, pe, pid, fps, last, offset, step, appendFps

  fps = 0
  last = Date.now()
  step = function() {
    offset = Date.now() - last
    fps += 1
    if (offset >= 1000) {
      last += offset
      appendFps(fps)
      fps = 0
    }
    requestAnimationFrame(step)
  }
  //显示fps; 如果未指定元素id，默认<body>标签
  appendFps = function(fps) {
    if (!e) e = document.createElement('span')
    pe = pid ? document.getElementById(pid) : document.getElementsByTagName('body')[0]
    e.innerHTML = 'fps: ' + fps
    pe.appendChild(e)
  }
  return {
    setParentElementId: function(id) {
      pid = id
    },
    go: function() {
      step()
    },
  }
})()
*/

export {
  randomValue,
  weightRandom
}