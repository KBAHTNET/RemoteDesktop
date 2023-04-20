'use strict';

import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import { store } from './store/store';


import { Socket } from 'socket.io-client';

declare global {
  interface Window {
    io: (url: string) => Socket
  }
}

const app = createApp(App);
app.use(store);
app.use(router);
app.mount('#app');
