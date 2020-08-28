const randomValue = function(config={}){
  let configs = Object.assign({
    min:1,
    max:10,
  },config)
  return Math.floor(Math.random() * ( configs.max - configs.min + 1 ) + configs.min)
}

export {
  randomValue
}