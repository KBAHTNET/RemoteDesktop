import { GetterTree } from 'vuex'
import { State } from './state'

export type Getters = {
  // doubledCounter(state: State): number
  getCookie_Auth():boolean,
  getCookie_CurrentAcc():string,
  getCookie_Accounts():Array<string>,
}

export const getters: GetterTree<State, State> & Getters = {
  getCookie_Auth():boolean {
    const cookies = {}; 
    Array.from(document.cookie.split(';')).forEach((it) => {
      it = it.replaceAll(' ', ''); 
      const key = it.split('=')[0]; 
      const value = it.split('=')[1]; 
      //@ts-ignore
      cookies[key] = value;
    });
    //@ts-ignore
    cookies.authorized = cookies.authorized && cookies.authorized === 'true' ? true : false;
    //@ts-ignore
    return cookies.authorized; 
  },
  getCookie_CurrentAcc():string {
    const cookies = {}; 
    Array.from(document.cookie.split(';')).forEach((it) => {
      it = it.replaceAll(' ', ''); 
      const key = it.split('=')[0]; 
      const value = it.split('=')[1]; 
      //@ts-ignore
      cookies[key] = value;
    });
    //@ts-ignore
    if (cookies.currentAcc) {
      //@ts-ignore
      return cookies.currentAcc; 
    } else {
      return '';
    }
  },
  getCookie_Accounts():Array<string> {
    const cookies = {}; 
    Array.from(document.cookie.split(';')).forEach((it) => {
      it = it.replaceAll(' ', ''); 
      const key = it.split('=')[0]; 
      const value = it.split('=')[1]; 
      //@ts-ignore
      cookies[key] = value;
    });

    //@ts-ignore
    if (cookies.accounts) {
      //@ts-ignore
      return cookies.accounts; 
    } else {
      return [];
    }
  },
}