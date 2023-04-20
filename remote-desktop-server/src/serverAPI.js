// @ts-check
'use strict';

//#region Imports

import * as http2 from 'http2';
import * as fs from 'fs';
import * as fileType from 'file-type';
import * as path from 'path';

import { GenerateRandomString, GetHashString } from './utils';
import { appConfigs } from './app.configs';
import { GetUserByLogin, IsTokenExists, AddAuthorize, GetAuthByToken, UpdateTokensByRefreshToken, CreateNewUser } from './databaseAPI';
import { serverConfigs } from './server.configs'

//#endregion

//#region Typedefs

/**@typedef {import('./server.configs').ICookies} ICookies*/
/**@typedef {import('./db-classes').IUser} IUser*/
/**@typedef {import('./db-classes').IAuthorize} IAuthorize*/
/**@typedef {import('./db-classes').ITokens} ITokens*/

//#endregion

//#region Init ClientFiles

const clientDir = path.resolve('../remote-desktop-client/dist')

//#region MainHtml 

const mainHtml = fs.readFileSync(path.resolve(clientDir, 'index.html'));

/**
 * @param {http2.ServerHttp2Stream} stream 
 */
export function returnMainHtml(stream) {
  stream.respond({
    ":status": 200,
    "Content-Type": "text/html",
  });
  stream.end(mainHtml);
}

const mainHtmlStaticFiles = FindClientFiles(clientDir);

export const html_files = {
  [mainHtmlStaticFiles.appjs.url]:mainHtmlStaticFiles.appjs.buffer,
  [mainHtmlStaticFiles.appjsmap.url]:mainHtmlStaticFiles.appjsmap.buffer,
  [mainHtmlStaticFiles.chunk.url]:mainHtmlStaticFiles.chunk.buffer,
  [mainHtmlStaticFiles.chunkmap.url]:mainHtmlStaticFiles.chunkmap.buffer,
  [mainHtmlStaticFiles.css.url]:mainHtmlStaticFiles.css.buffer,
}

/**
 * @param {string} clientDir 
 * @returns {{css:{url:string,buffer:Buffer},appjs:{url:string,buffer:Buffer},appjsmap:{url:string,buffer:Buffer},chunk:{url:string,buffer:Buffer},chunkmap:{url:string,buffer:Buffer}}}
 */
function FindClientFiles(clientDir) {
  const cssPath = fs.readdirSync(path.resolve(clientDir, 'css'));
  const jsPathes = fs.readdirSync(path.resolve(clientDir, 'js'));

  const jsRegExp = new RegExp('app.{0,30}js$');
  const jsMapRegExp = new RegExp('app.{0,30}js\.map$');
  const chunkRegExp = new RegExp('chunk.{0,30}js$');
  const chunkMapRegExp = new RegExp('chunk.{0,30}js.map');

  let jsPath = '';
  let jsMapPath =  '';
  let chunkPath = '';
  let chunkMapPath = '';

  jsPathes.forEach(it => {
    if(it.match(jsRegExp)) {
      jsPath = it;
    }
    if(it.match(jsMapRegExp)) {
      jsMapPath = it;
    }
    if(it.match(chunkRegExp)) {
      chunkPath = it;
    }
    if(it.match(chunkMapRegExp)) {
      chunkMapPath = it;
    }
  });

  return {
    css: {url:'/css/' + cssPath[0].replace(/^.*[\\\/]/, ''),buffer:fs.readFileSync(path.resolve(clientDir, 'css', cssPath[0]))},
    appjs:{url: '/js/' + jsPath.replace(/^.*[\\\/]/, ''),buffer:fs.readFileSync(path.resolve(clientDir, 'js', jsPath))},
    appjsmap:{url: '/js/' + jsMapPath.replace(/^.*[\\\/]/, ''),buffer:fs.readFileSync(path.resolve(clientDir, 'js', jsMapPath))},
    chunk:{url: '/js/' + chunkPath.replace(/^.*[\\\/]/, ''), buffer:fs.readFileSync(path.resolve(clientDir, 'js', chunkPath))},
    chunkmap: {url: '/js/' + chunkMapPath.replace(/^.*[\\\/]/, ''),buffer:fs.readFileSync(path.resolve(clientDir, 'js', chunkMapPath))},
  }
}

/**
 * 
 * @param {http2.ServerHttp2Stream} stream 
 * @param {string} url 
 */
 export function responseHtmlFiles(stream, url) {
  /** @type {Buffer}*/const file = html_files[url];

  let content_type = '';
  if(url.includes('.css')) {
    content_type = 'text/css';
  }

  if(url.includes('.js')) {
    content_type = 'application/javascript';
  }

  stream.respond({
    ":status": 200,
    "Content-Type": content_type,
  });
  stream.end(file);
}

//#endregion

//#region StaticFiles

export const static_files = [...fs.readdirSync(path.resolve(clientDir, 'img')), ...fs.readdirSync(path.resolve(clientDir, 'media'))];
const static_hash = {};
const accordExtMime = {
  svg: 'image/svg+xml',
  jpg: 'image/jpeg',
  png: 'image/png',
  mp3: 'audio/mpeg',
  ico: 'image/vnd.microsoft.icon',
} 
/**
 * @param {string} url 
 * @returns {boolean}
 */
export function isRequestStatic(url) {
  for(let file of static_files) {
    if(url.includes(file)) {
      return true
    }
  }
  return false;
}

/**
 * 
 * @param {http2.ServerHttp2Stream} stream 
 * @param {string} url 
 */
export function returnStatic(stream, url) {
  if(!(url in static_hash)) {
    const filepath = path.join(clientDir, url);
    const splitBackSlash = url.split('\\');
    const splitSlash = splitBackSlash[splitBackSlash.length - 1].split('/');
    const splitDot = splitSlash[splitSlash.length - 1].split('.');
    const ext = splitDot[splitDot.length - 1];
    const file = fs.readFileSync(filepath);
    fileType.fileTypeFromBuffer(file).then(fileInfo => {
      return new Promise((resolve,reject) => {
        const staticFileObj = {
          content: file,
          mime: accordExtMime[ext],
        }
        static_hash[url] = staticFileObj;

        stream.respond({
          ':status': 200,
          'Content-Type': staticFileObj.mime,
          'Content-Length': staticFileObj.content.length
        });
        resolve(stream.end(staticFileObj.content));
      });
    });
  } else {
    /**@type {{content:Buffer,mime:string}}*/const staticFileObj = static_hash[url];

    stream.respond({
      ':status': 200,
      'Content-Type': staticFileObj.mime,
      'Content-Length': staticFileObj.content.length
    });
    stream.end(staticFileObj.content);
  }
}

//#endregion

//#endregion

//#region API Functions

/**
 * Проверка доступности сервера (запрос делает программа, позволяющая управлять компьютером)
 * @param {http2.ServerHttp2Stream} stream 
 */
export function checkServerAccess(stream) {
  stream.on('data', chunk => {
    const msg = chunk.toString();
    /**
     * @type {Buffer | null}
     */
    let resposeMsg = null;
    if(msg === appConfigs.checkServerPingRestAPIRequest) {
      resposeMsg = Buffer.from(appConfigs.checkServerPingRestAPIResponse);
    }
    else {
      resposeMsg = Buffer.from('unregistered format speaking with server');
    }
    stream.respond({
      ":status": 200,
      "Content-Type": "application/octet-stream",
      "Content-Length": resposeMsg.length,
    });
    stream.write(resposeMsg);
  });
  stream.on('end', () => {
    stream.end();
  });
}

/**
 * API авторизации по логину и паролю
 * @param {{stream:http2.ServerHttp2Stream, headers:http2.IncomingHttpHeaders}} object 
 */
export function Authorize(object) {
  const stream = object.stream;
  const headers = object.headers;

  /**@type {{login:string,pass:string,passHash:string}}*/let userData = {login:'', pass:'', passHash: ''};

  stream.once('data', data => {
    userData = JSON.parse(data.toString());
  });
  stream.once('end', async () => {
    if(userData.login && userData.pass) {
      userData.passHash = GetHashString(userData.pass);
      /**@type {IUser}*/const user = await GetUserByLogin(userData.login);
      if(user.passHash === userData.passHash) {
        /**@type {Buffer}*/const responce = Buffer.from(serverConfigs.SUCCESS_MSG);
        const tokens = await GenerateNewPairTokens(user.login);

        //bd write
        /**@type {string}*/const ip_port = stream.session.socket.remoteAddress + " " + stream.session.socket.remotePort;
        //@ts-ignore
        /**@type {string}*/const userAgent = headers[http2.constants.HTTP2_HEADER_USER_AGENT]?.toString();
        AddAuthorize({userData: user, tokens: tokens, ip_port: ip_port, userAgent: userAgent})
        
        stream.respond({
          ':status': 200,
          'Content-Type': 'text/plain',
          'Content-Length': responce.byteLength,
          'Set-Cookies': [
            `${serverConfigs.COOKIES.currentAccount}=${userData.login};Secure;Expires=${tokens.refresh_token_date}`,
            `${serverConfigs.COOKIES.accounts}=["${userData.login}"];Secure;Expires=${tokens.refresh_token_date}`,
            `${serverConfigs.COOKIES.access_user_token}=${tokens.access_token};HttpOnly;Secure;Expires=${tokens.access_token_date}`,
            `${serverConfigs.COOKIES.refresh_user_token}=${tokens.refresh_token};HttpOnly;Secure;Expires=${tokens.refresh_token_date}`,
            `${serverConfigs.COOKIES.auth}=${serverConfigs.COOKIES.auth_true};Secure;Expires=${tokens.refresh_token_date}`
          ]
        });
        stream.end(responce);
      } else {
        ResponceTextByStream('Неверный пароль', stream);
      }
    } else {
      ResponceTextByStream('Неверный формат payload. Обязательные поля "login" и "pass"', stream);
    }
  });
}

/**
 * 
 * @param {{stream:http2.ServerHttp2Stream}} object 
 */
export function Registration(object) {
  const stream = object.stream;
  
  /**@type {{login:string,pass:string}}*/const userData = {
    login: '',
    pass: ''
  }

  stream.once('data', (data) => {
    const obj = JSON.parse(data.toString());
    if(obj.hasOwnProperty('login') && obj.hasOwnProperty('pass')) {
      userData.login = obj.login;
      userData.pass = obj.pass;
    } else {
      ResponceTextByStream('Неверный объект. Обязательные поля "login" и "pass"', stream);
    }
  });

  stream.once('end', async () => {
    if(!stream.closed) {
      const responce = Buffer.from(serverConfigs.SUCCESS_MSG);
      const tokens = await GenerateNewPairTokens(userData.login);
      CreateNewUser(userData);
      // /**@type {IUser}*/const user = {
      //   id:
      // };
      // AddAuthorize();
      stream.respond({
        ':status': 200,
        'Content-Type': 'text/plain',
        'Content-Length': responce.byteLength,
        'Set-Cookies': [
        `${serverConfigs.COOKIES.currentAccount}=${userData.login};Secure;Expires=${tokens.refresh_token_date}`,
        `${serverConfigs.COOKIES.accounts}=["${userData.login}"];Secure;Expires=${tokens.refresh_token_date}`,
        `${serverConfigs.COOKIES.access_user_token}=${tokens.access_token};HttpOnly;Secure;Expires=${tokens.access_token_date}`,
        `${serverConfigs.COOKIES.refresh_user_token}=${tokens.refresh_token};HttpOnly;Secure;Expires=${tokens.refresh_token_date}`,
        `${serverConfigs.COOKIES.auth}=${serverConfigs.COOKIES.auth_true};Secure;Expires=${tokens.refresh_token_date}`
      ],
      });
      stream.end(responce);
    }
  });

}

export function Exit(object) {
  
}

export function ExitAll(object) {
  
}

//#endregion

//#region Helpers

/**
 * Вспомогательная функция для исключения копи-паста
 * @param {string} text текст для отправки
 * @param {http2.ServerHttp2Stream} stream
 */
function ResponceTextByStream(text, stream) {
  /**@type {Buffer}*/const responce = Buffer.from(text); 
  stream.respond({
    ':status': 200,
    'Content-Type': 'text/plain',
    'Content-Length': responce.byteLength,
  });
  stream.end(responce);
}

/**
 * Генерация пары токенов
 * @param {string} login Логин пользователя
 * @returns {Promise<ITokens>} Возвращает объект {access_token, refresh_token}
 */
async function GenerateNewPairTokens(login) {
  let access_token = GenerateRandomString(serverConfigs.COOKIES.access_user_token_length);
  while(await IsTokenExists(access_token)) {
    access_token = GenerateRandomString(serverConfigs.COOKIES.access_user_token_length);
  }

  let refresh_token = GenerateRandomString(serverConfigs.COOKIES.access_user_token_length);
  while(await IsTokenExists(refresh_token)) {
    refresh_token = GenerateRandomString(serverConfigs.COOKIES.access_user_token_length);
  }

  const access_token_date = new Date();
  const refresh_token_date = new Date();
  access_token_date.setHours(access_token_date.getHours() + 1);
  refresh_token_date.setMonth(refresh_token_date.getMonth() + 6);

  return {
    login,
    access_token: access_token,
    refresh_token: refresh_token,
    access_token_date: access_token_date.toUTCString(),
    refresh_token_date: refresh_token_date.toUTCString()
  }
}

/**
 * Проверка авторизации и токенов
 * @param {ICookies} cookies
 * @return {Promise<boolean>} Возвращает "true", если у объекта есть активный токен доступа в базе данных или активный токен обновления для получения новой пары токенов
 */
async function CheckAuthorize(cookies) {
  // const cookies = object.cookies;
  const now = new Date();
  if(cookies.access_user_token) {
    const auth = await GetAuthByToken(cookies.access_user_token);
    const access_token_date = new Date(auth.tokens.access_token_date);
    if(auth.tokens.access_token === cookies.access_user_token && access_token_date > now) {
      return true;
    } else {
      return false;
    }
  } else if(cookies.refresh_user_token){
    const auth = await GetAuthByToken(cookies.refresh_user_token);
    const refresh_token_date = new Date(auth.tokens.refresh_token_date);
    if(auth.tokens.refresh_token === cookies.refresh_user_token && refresh_token_date > now) {
      //db getNewPair and Delete old tokens by refresh_token
      const newTokens = await GenerateNewPairTokens(auth.tokens.login);
      const old_refresh_token = cookies.refresh_user_token;
      const res = await UpdateTokensByRefreshToken({newTokens, old_refresh_token});
      if (res === serverConfigs.SUCCESS_MSG) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}

//#endregion