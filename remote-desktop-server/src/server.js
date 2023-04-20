
// @ts-check
'use strict';

//#region Imports

import { createSecureServer } from 'http2';
import { createServer } from 'http';

import { ConnectToDB } from './databaseAPI';
import { InitServerSocket } from './serverSocket';
import { InitEndpoints } from './serverEndpoints';
import { serverConfigs } from './server.configs'; 

//#endregion

//#region Typedefs

/**@typedef {import('./server.configs').ICookies} ICookies*/

//#endregion


//#region Подключение к базе данных и инициализация

ConnectToDB(serverConfigs.DB_CONNECTION_STRING);

//#endregion


//#region Инициализация сервера

const server = createSecureServer({
  ...serverConfigs.SERVER_CERTIFICATE,
  allowHTTP1: true,
});

const httpServer = createServer(
  (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.end('<script>window.location = "https://" + window.location.host + ":' + serverConfigs.APP_PORT + '"+ window.location.pathname</script>');
});

//#endregion


//#region Server Error Handlers

server.on('sessionError', (err) => {
  console.log('_____Ошибка сессии_____\n', err);
});

server.on('error', (err) => {
  console.log('_____Ошибка сервера_____\n', err);
});

//#endregion

server.on('stream', (stream, headers) => {

  stream.once('error', (err) => {
    console.log('____Ошибка потока_____\n', err);
  });

  //#region Parse request

  /**
   * @type {'get'|'post'}
   */
  //@ts-ignore
  const method = headers[':method'].toString().toLowerCase();
  //@ts-ignore
  const url = decodeURIComponent(headers[':path']).split('?')[0];
  const url_args = {};
  try {
    //@ts-ignore
    const args = decodeURIComponent(headers[':path']).split('?')[1].split('#')[0].split('&');
    for (const arg of args) {
      if (arg.split('=').length > 1) {
        url_args[arg.split('=')[0]] = arg.split('=')[1];
      }
    }
  } catch {}


  /**@type {ICookies}*/const cookies = {
    access_user_token: '',
    refresh_user_token: '',
    authorized: false,
    accounts: [],
    currentAcc: '',
  };

  headers['cookie']?.split(';').forEach((it) => {
    const key = it.split('=')[0].split(' ').join('');
    const value = it.split('=')[1];
    cookies[key] = value;
  });

  try {
    cookies.accounts = JSON.parse(cookies.accounts);
  }
  catch {
    cookies.accounts = []
  }

  //@ts-ignore
  cookies.authorized = cookies.authorized === 'true' ? true : false; 

  //#endregion

  InitEndpoints({stream, url, method, headers, cookies});
});

InitServerSocket(server);

//#region Server Start

server.listen(serverConfigs.APP_PORT);
httpServer.listen(80);

//#endregion