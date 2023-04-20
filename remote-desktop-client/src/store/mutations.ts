import { MutationTree } from 'vuex'
import { MutationTypes } from './mutation-types'
import { State } from './state'

export type Mutations<S = State> = {
  [MutationTypes.UpdateLogin](state:S, newValue:string):void,
  [MutationTypes.UpdatePass](state:S, newValue:string):void,
}

export const mutations: MutationTree<State> & Mutations = {
  [MutationTypes.UpdateLogin](state:State, newValue:string):void {
    state.userdata.login = newValue;
  },
  [MutationTypes.UpdatePass](state:State, newValue:string):void {
    state.userdata.pass = newValue;
  },
}