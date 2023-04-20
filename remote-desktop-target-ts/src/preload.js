//@ts-check
'use strict'

console.log('preload');

const { contextBridge, ipcRenderer } = require("electron");

//#region Register ipcRenderer

/**
 * @type {Array<String>}
 */
const validChannels = [];
const events = require('./ipc-events');

for(const [key, value] of Object.entries(events)) {
  validChannels.push(value);
}

contextBridge.exposeInMainWorld("ipc", {
  send: (/**@type {string}*/channel, /**@type {string}*/data) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (/**@type {string}*/channel, /**@type {Function}*/func) => {
    if (validChannels.includes(channel)) {
      // Strip event as it includes `sender` and is a security risk
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  once: (/**@type {string}*/channel, /**@type {Function}*/func) => {
    if (validChannels.includes(channel)) {
      // Strip event as it includes `sender` and is a security risk
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    }
  }
});

//#endregion
