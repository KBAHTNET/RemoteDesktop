import { ActionTree, ActionContext } from 'vuex';
import { State, Connection } from './state';
import { Mutations } from './mutations';
import { ActionTypes } from './action-types';
import { MutationTypes } from './mutation-types';
import { serverAPIPath, serverAPI, socketPath } from '@/serverAPI.interface';

import {socketEvents} from '@/socket-events';
import {appConfigs} from '@/app.constants';

import {Socket, io} from 'socket.io-client';

type AugmentedActionContext = {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>
} & Omit<ActionContext<State, State>, 'commit'>

export interface Actions {
  [ActionTypes.checkCompForAccess](ctx: AugmentedActionContext, compName: string): Promise<boolean>,
  [ActionTypes.auth](ctx: AugmentedActionContext, userdata: {login:string,pass:string}): Promise<boolean>,
  [ActionTypes.registration](ctx: AugmentedActionContext, userdata: {login:string,pass:string}): Promise<boolean|string>,
  
  [ActionTypes.initMedia](ctx: AugmentedActionContext):void,
  [ActionTypes.initSocket](ctx: AugmentedActionContext):void,
  [ActionTypes.connectToComp](ctx:AugmentedActionContext, compData:Connection): void,
}


export const actions: ActionTree<State, State> & Actions = {
  [ActionTypes.checkCompForAccess](ctx: AugmentedActionContext, compName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      serverAPI[serverAPIPath.checkCompForAccess](compName).then(res => {
        resolve(res);
      });
    });
  },
  [ActionTypes.auth](ctx: AugmentedActionContext, userdata: {login:string,pass:string}): Promise<boolean>{
    return new Promise((resolve, reject) => {
      serverAPI[serverAPIPath.auth](userdata).then(res => {
        resolve(res);
      });
    });
  },
  [ActionTypes.registration](ctx: AugmentedActionContext, userdata: {login:string,pass:string}): Promise<boolean|string>{
    return new Promise((resolve, reject) => {
      serverAPI[serverAPIPath.registration](userdata).then(res => {
        resolve(res);
      });
    });
  },

  [ActionTypes.initMedia](ctx: AugmentedActionContext):void {
    console.log('initMedia');

    ctx.state.mediaObjet.reInitingBuffer = true;
  
    ctx.state.mediaObjet.queue = [];
    if(ctx.state.mediaObjet.source && ctx.state.mediaObjet.buffer && ctx.state.mediaObjet.source.sourceBuffers.length > 0) {
      ctx.state.mediaObjet.source.removeSourceBuffer(ctx.state.mediaObjet.buffer);
    }
  
    if(ctx.state.mediaObjet.url && ctx.state.mediaObjet.url.length > 0) {
      try {
        URL.revokeObjectURL(ctx.state.mediaObjet.url);
      } catch {}
    }
  
    ctx.state.mediaObjet.source = new MediaSource();
    ctx.state.mediaObjet.url = URL.createObjectURL(ctx.state.mediaObjet.source);
  
    ctx.state.mediaObjet.source.addEventListener('sourceopen', () => {
      console.log('sourceopen');
      
      ctx.state.mediaObjet.isInitMediaSource = true;
      
      ctx.state.mediaObjet.buffer = ctx.state.mediaObjet.source.addSourceBuffer(appConfigs.recorderCodec);
      ctx.state.mediaObjet.buffer?.addEventListener('updateend', () => {
        if(ctx.state.mediaObjet.queue.length > 0) {
          if(!ctx.state.mediaObjet.reInitingBuffer && ctx.state.mediaObjet.source?.readyState === 'open' && ctx.state.mediaObjet.source.sourceBuffers.length > 0) {
            ctx.state.mediaObjet.buffer?.appendBuffer(ctx.state.mediaObjet.queue.shift());
          }
        }
      });

    });
  
    ctx.state.mediaObjet.reInitingBuffer = false;
  },
  [ActionTypes.initSocket](ctx: AugmentedActionContext):void {
    console.log('initSocket');
    
    ctx.state.socket = null;

    const socket = io(socketPath);

    socket.once('connect', () => {});
    socket.once('disconnect', () => {});
    socket.once(socketEvents.checkType, () => {
      socket.emit(socketEvents.checkType, socketEvents.checkType_ClientResponse);
    });
    socket.on(socketEvents.canUserConnectToTarget, (result) => {
      console.log(socketEvents.canUserConnectToTarget, result);
      
      if(result == socketEvents.canConnectPositiveResponse) {
        socket.emit(socketEvents.requestCapture);
      }
      if(result == socketEvents.canConnectNegativeResponse) {}
    });
    socket.on(socketEvents.targetPing, () => {
      console.log('%c socket ping from target', "color: red;");
      socket.emit(socketEvents.targetPing, socketEvents.targetPingResponse);
    });

    socket.on(socketEvents.responseCapture, (data) => {
      console.log(data);
      
      console.log(ctx.state.mediaObjet.source.readyState, data);
              
      if(ctx.state.mediaObjet.buffer?.updating || ctx.state.mediaObjet.reInitingBuffer) {
        ctx.state.mediaObjet.queue.push(data);
      } else {
        if(ctx.state.mediaObjet.source.readyState === 'open') {
          ctx.state.mediaObjet.buffer?.appendBuffer(data);
        }
      }
    });
    socket.on(socketEvents.requestCapture, (result) => {
      console.log(socketEvents.requestCapture, result);
      
      if(result) {
        console.log('requestCapture');
  
        if(!ctx.state.videoCaptureContainer?.paused) {
          ctx.state.videoCaptureContainer?.pause();
        }
  
        ctx.dispatch(ActionTypes.initMedia);
  
        //@ts-ignore
        ctx.state.videoCaptureContainer.src = ctx.state.mediaObjet.url;
        ctx.state.videoCaptureContainer?.play();
        // setTimeout(() => {
        //   if(ctx.state.videoCaptureContainer?.currentTime) {
        //     ctx.state.videoCaptureContainer.currentTime = 99999;
        //   }
        // }, 1000);
      }
    });

    ctx.state.socket = socket;
  },

  [ActionTypes.connectToComp](ctx:AugmentedActionContext, compData:Connection): void {
    console.log('try connect');

    const socket = ctx.state.socket as Socket;

    if(compData.conMethdod ==='image sourcing') {

    } else if(compData.conMethdod === 'streaming') {
      socket.emit(socketEvents.canUserConnectToTarget, {name:'WIN-VSETJITQ0C2', pass:'admin', clientName:'test'});
    }
  },
}
