//@ts-check
'use strict'

import * as http2 from 'http2';

import * as serverAPI from './serverAPI';
import { appConfigs } from './app.configs';

/**@typedef {import('./server.configs').ICookies} ICookies */

const mainViews = ['/', '/signin', '/signup']
const apiPath = '/api';

/**@typedef {{path:string,method:'get'|'post'}} endpoint*/
const endpoints = {
  /**@type {endpoint}*/checkCompForAccess: {
    path: apiPath + '/checkCompForAccess', 
    method: 'post'
  },
  
  //@ts-ignore
  /**@type {endpoint}*/PingServer: {
    path:appConfigs.checkServerPingRestAPIPath,
    method:appConfigs.checkServerPingRestAPIMethod.toLowerCase()
  },

  /**@type {endpoint}*/registration: {
    path: '/registration',
    method: 'post'
  },

  /**@type {endpoint}*/authorize: {
    path: '/authorize',
    method: 'post'
  },

  /**@type {endpoint}*/exit: {
    path: '/exit',
    method: 'post'
  },

  /**@type {endpoint}*/exitAll: {
    path: '/exit_all',
    method: 'post'
  },
}

const excludeSocketEndpoint = '/socket.io/'

/**
 * @param {{stream:http2.ServerHttp2Stream, url:string, headers:http2.IncomingHttpHeaders, method:'get'|'post', cookies:ICookies}} object 
 */
export function InitEndpoints(object) {
  const stream = object.stream;
  const url = object.url;
  const headers = object.headers;
  const method = object.method;
  const cookies = object.cookies;

  if(mainViews.includes(url) && method === 'get') {
    return serverAPI.returnMainHtml(stream);
  } else if(url in serverAPI.html_files) {
    return serverAPI.responseHtmlFiles(stream, url);
  } else if(serverAPI.isRequestStatic(url) && method === 'get') {
    return serverAPI.returnStatic(stream, url);
  } else if(url === endpoints.authorize.path && method === endpoints.authorize.method) {
    return serverAPI.Authorize({stream, headers});
  } else if (url === endpoints.registration.path && method === endpoints.registration.method) {
    // return serverAPI.Registration();
    return;
  } else if (url === endpoints.exit.path && method === endpoints.exit.method) {
    return;
  } else if(url === endpoints.exitAll.path && method === endpoints.exitAll.method) {
    return;
  }
  else if(url === endpoints.PingServer.path && method === endpoints.PingServer.method) {
    return serverAPI.checkServerAccess(stream);
  } else if(url === endpoints.checkCompForAccess.path && method === endpoints.PingServer.method) {
    let comp = '';
    stream.once('data', data => {
      comp = data.toString();
    })
    stream.once('end', () => {
      if(comp == 'myComp' || comp == 'Ubunti123') {
        const responce = Buffer.from('true');
        stream.respond({
          ':status': 200,
          'Content-Type': 'text/plain',
          'Content-Length': responce.length
        });
        return stream.end(responce);
      } else {
        const responce = Buffer.from('false');
        stream.respond({
          ':status': 200,
          'Content-Type': 'text/plain',
          'Content-Length': responce.length
        });
        return stream.end(responce);
      }
    });
  }
  else if (excludeSocketEndpoint.includes(url)) {
    return;
  }
  else {
    stream.respond({
      ':status': 200,
      'Content-type': 'text/plain;charset=utf8'
    });
    return stream.end('У самурая нет такого пути.');
  }
};