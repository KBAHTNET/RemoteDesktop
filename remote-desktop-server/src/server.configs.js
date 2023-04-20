'use strict';
//@ts-check

import { readFileSync } from 'fs';
import { resolve } from 'path';

export const serverConfigs = {
  APP_PORT: 9944,
  DB_CONNECTION_STRING: 'mongodb://localhost:27017', //адрес подключения к базе данных
  DB_NAME: 'kvant_remote_access',

  SERVER_CERTIFICATE: {
    key: readFileSync(resolve('./certificate/key.pem')),
    cert: readFileSync(resolve('./certificate/cert.pem'))
  },

  COOKIES: {
    access_user_token: 'acces_user_token',
    access_user_token_length: 300,

    refresh_user_token: 'refresh_user_token',
    refresh_user_token_length: 300,

    auth: 'authorized',
    auth_true: 'true',
    auth_false: 'false',

    currentAccount: 'currentAcc',
    accounts: 'accounts'
  },
  
  SUCCESS_MSG: 'ok',
  START_USER_ID: 10000,
}

//Интерфейс кук - поля должны совпадать со значением в объекте COOKIES
/**@typedef {{access_user_token:string, refresh_user_token:string, authorized:boolean, accounts:Arary<string>, currentAcc:string}} ICookies*/