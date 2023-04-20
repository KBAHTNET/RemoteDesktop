'use strict'

//#region import libs

import { app, protocol, BrowserWindow, ipcMain, desktopCapturer } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
const isDevelopment = process.env.NODE_ENV !== 'production';

import os from 'os';
import fs from 'fs';
import path from 'path';

//#endregion

//#region AppInit

app.commandLine.appendSwitch('ignore-certificate-errors', 'true'); //socket.io.client don't connect, because self-signed certificate
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; //can't connect to my server, because self-signed certificate


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true} }
])

let MainWindow:BrowserWindow;

async function createWindow(window:BrowserWindow) {
  // Create the browser window.
  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, //socket.io.client don't connect, because self-signed certificate + cors
      preload: path.resolve('src', 'preload.js'),
    },
  });
  window.menuBarVisible = false;

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await window.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) window.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    window.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow(MainWindow);
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  registerLocalResourceProtocol();
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      const error = e as Error;
      console.error('Vue Devtools failed to install:', error.toString())
    }
  }
  createWindow(MainWindow);
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

function registerLocalResourceProtocol() {
  protocol.registerFileProtocol('local-resource', (request, callback) => {
    const url = request.url.replace(/^local-resource:\/\//, '')
    // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
    const decodedUrl = decodeURI(url) // Needed in case URL contains spaces
    try {
      return callback(decodedUrl)
    }
    catch (error) {
      console.error('ERROR: registerLocalResourceProtocol: Could not get file path:', error)
    }
  })
}

//#endregion

//#region IPCEventsHandlers

interface AppSettings {
  targetName:string,
  targetPass:string,
  server:string;
  port:number;
  isFullControl:boolean;
  isTranslateSound:boolean;
  isMultiConnection:boolean;
  isShowCursorsConnection:boolean;
  isUnControlAccess:boolean;
}

const hostname = os.hostname();

const settingsObject:AppSettings = {
  targetName: hostname,
  targetPass:'admin',
  server: 'localhost',
  port: 443,
  isFullControl: false,
  isTranslateSound: false,
  isMultiConnection: false,
  isShowCursorsConnection: false,
  isUnControlAccess: false,
}

import * as events from './ipc-events';
import * as app_constants from './app.constants';

ipcMain.on(events.checkSettings, (event, payload) => {
  if (fs.existsSync(app_constants.SettingsFile)) {
    const settingsText = fs.readFileSync(app_constants.SettingsFile, 'utf-8');
    const settings = JSON.parse(settingsText);
    let isSettings = true;
    
    for (const key in settingsObject) {
      if(!settings.hasOwnProperty(key)) {
        fs.writeFile(app_constants.SettingsFile, JSON.stringify(settingsObject), {encoding: 'utf-8'}, ()=>{});
        event.reply(events.checkSettings, JSON.stringify(settingsObject));
        isSettings = false;
        break;
      }
    }
    if(isSettings) {
      event.reply(events.checkSettings, JSON.stringify(settings));
    }
  } else {
    fs.writeFile(app_constants.SettingsFile, JSON.stringify(settingsObject), {encoding: 'utf-8'}, ()=>{});
    event.reply(events.checkSettings, JSON.stringify(settingsObject));
  }
});

ipcMain.on(events.acceptNewSettings, (event, payload) => {
  
  // const newSettings = JSON.stringify(payload);
  try {
    fs.writeFileSync(app_constants.SettingsFile, payload, {encoding: 'utf-8', flag: 'w'});
    event.reply(events.acceptNewSettings, 'true');
  }
  catch {
    event.reply(events.acceptNewSettings, 'false');
  }
});

ipcMain.on(events.registerSocketIO, (event, payload) => {
  const script = fs.readFileSync(app_constants.SocketIOClientFileScriptPath, {encoding: 'utf-8'});
  event.reply(events.registerSocketIO, script)
});

ipcMain.on(events.getScreenSources, (event, payload) => {
  desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async (sources) => {
    event.reply(events.getScreenSources, JSON.stringify(sources));
  });
});

//#endregion