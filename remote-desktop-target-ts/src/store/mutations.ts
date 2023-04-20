import { MutationTree } from 'vuex'
import { MutationTypes } from './mutation-types'
import { State } from './state'

export type Mutations<S = State> = {
  [MutationTypes.setCaptureStream](state: S, newStream: MediaStream): void,
  [MutationTypes.setStreamRecorder](state: S, newRecorder: MediaRecorder): void,
  [MutationTypes.setClientSocket](state: S, newSocket: any): void,
}

export const mutations: MutationTree<State> & Mutations = {
  [MutationTypes.setCaptureStream](state: State, newStream: MediaStream) {
    state.captureStream = newStream;
  },
  [MutationTypes.setStreamRecorder](state: State, newRecorder: MediaRecorder) {
    state.streamRecorder = newRecorder;
  },
  [MutationTypes.setClientSocket](state: State, newSocket: any) {
    state.socket = newSocket;
  },
}