'use strict';

import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import {store} from './store/store';

import { io, Socket } from "socket.io-client";

//preload.js define ipcManger
type MyFunction = (a:string, b:any) => void;
declare global {
  interface Window { 
    ipc: {
      send:(eventName:string, payload?:string) => void, 
      on:(eventName:string, callbackResult:(payload:string) => void) => void,
      once:(eventName:string, callbackResult:(payload:string) => void) => void
    },
    io: (url:string) => Socket
  }
}

const app = createApp(App);
app.use(store);
app.use(router);
app.mount('#app');

// createApp(App).use(store).use(router).mount('#app');
