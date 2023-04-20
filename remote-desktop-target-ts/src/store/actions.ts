import { ActionTree, ActionContext } from 'vuex';
import { State } from './state';
import { Mutations } from './mutations';
import { ActionTypes } from './action-types';
import { MutationTypes } from './mutation-types';
import * as events from '../ipc-events';
import { DesktopCapturerSource } from 'electron';



type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>
} & Omit<ActionContext<State, State>, 'commit'>

export interface Actions {
  [ActionTypes.getScreenSources](ctx:AugmentedActionContext):Promise<DesktopCapturerSource[]>,
}

export const actions: ActionTree<State, State> & Actions = {
  [ActionTypes.getScreenSources](ctx:AugmentedActionContext) {
    return new Promise((resolve, reject) => {
      window.ipc.send(events.getScreenSources);

      window.ipc.once(events.getScreenSources, screenSources => {
        const sources:DesktopCapturerSource[] = JSON.parse(screenSources);
        resolve(sources);
      });
    });
  },
}