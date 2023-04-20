import { Store } from 'vuex'
import { p } from '@/store/oldstore/models/p.model'
declare module '@vue/runtime-core' {
  // declare your own store states
  interface State {
    count: number, 
    p: p,
  }

  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>
  }
}