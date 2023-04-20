import { State } from 'vue'
import { createStore, Store } from 'vuex'
import { p, P } from './models/p.model'
export default createStore({
  state: () => {
    return {
      count: 0,
      p: {} as p
    }
  },
  getters: {
  },
  mutations: {
    qwerty(state:State, payload) {
        
    }
  },
  actions: {
  },
  modules: {
  }
})
