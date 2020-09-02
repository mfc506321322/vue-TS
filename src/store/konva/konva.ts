interface State {
  [propName: string]: any
}

const state = {}

const initState = {}

const getters = {}

const actions = {}

const mutations = {
  updateState (state:State, data:Array<any>):void {
    state.data[0] = data[1]
  },
  initializeState (state:State, data:any):void {
    Object.assign(state, initState)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
