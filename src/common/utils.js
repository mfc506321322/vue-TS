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


export {
  randomValue,
  weightRandom
}