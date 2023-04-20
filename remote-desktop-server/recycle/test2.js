
// @ts-check
'use strict';

//#region Подключение библиотек

import { createSecureServer } from 'http2';
import { createServer } from 'http';
import { MongoClient } from 'mongodb';

import { InitEndpoints } from './serverEndpoints';
import { serverConfigs } from './server.configs'; 
/**@typedef {import('./server.configs').ICookies} ICookies*/

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
}
);

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

  stream.on('error', (err) => {
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
  };

  headers['cookie']?.split(';').forEach((it) => {
    const key = it.split('=')[0].split(' ').join('');
    const value = it.split('=')[1];
    cookies[key] = value;
  });

    //@ts-ignore
    cookies.authorized = cookies.authorized === 'true' ? true : false; 

  //#endregion

  console.log(stream.session.socket.remoteAddress,  stream.session.socket.remotePort);
  console.log(cookies);
  InitEndpoints({stream, url, method, headers, cookies});

});

//#region Запуск сервера

server.listen(serverConfigs.APP_PORT);
httpServer.listen(80);

//#endregion