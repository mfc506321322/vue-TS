const randomValue = function(config={}){
  let configs = Object.assign({
    min:1,
    max:10,
  },config)
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

const weightRandom = function(arr){
  let weightArr = arr.map(item => {
    return item.weight
  }),
  newWeightArr = commonDivisor(weightArr).newArr,
  newArr = [],
  value = null
  arr.forEach((item,index) => {
    for(let i=1;i<=newWeightArr[index];i++){
      newArr.push(item.value)
    }
    // newArr.fill(item.value,newArr.length,newArr.length+newWeightArr[index]-1)
  })
  value = newArr[randomValue({ min:0,max:newArr.length - 1 })]
  return value
}


export {
  randomValue,
  weightRandom
}