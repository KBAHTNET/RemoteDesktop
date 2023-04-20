//@ts-check
'use strict';

//#region imports

import * as mongo from 'mongodb';
import { Collection, Db, MongoClient } from 'mongodb';
import { JSON_Schemes, Authorize, User } from './db-classes';
import { serverConfigs } from './server.configs'
import { GetHashString } from './utils';

//#endregion

//#region typedefs

/**@typedef {import('./db-classes').IAuthorize} IAuthorize*/
/**@typedef {import('./db-classes').IUser} IUser*/
/**@typedef {import('./db-classes').ITokens} ITokens*/

//#endregion

//#region fields

/**@type {Db|null}*/let db = null;
/**@type {Collection<Document>|null}*/export let users = null;
/**@type {Collection<Document>|null}*/export let authorizes = null;

//#endregion

//#region Database Init Functions

/**
 * Подключиться к базе данных
 * @param {String} db_connection_string строка подключения
 * @returns {Promise<MongoClient>} Возвращает экземпляр клиента подключения к базе данных
 */
export function ConnectToDB(db_connection_string) {
  const dbclient = new MongoClient(db_connection_string);
  return new Promise((resolve, reject) => {
    dbclient.connect().then(() => {
      console.log('Соединение с базой установлено...');
      db = dbclient.db(serverConfigs.DB_NAME);

      //#region Collections

      users = db.collection(JSON_Schemes.users.name);
      authorizes = db.collection(JSON_Schemes.authorizes.name);

      //#endregion

      dbclient.addListener('connectionClosed', (e) => {
        ConnectToDB(db_connection_string);
      });

      CreateDB();
      resolve(dbclient);
    }).catch(e => {
      console.log('Соединение с базой не установлено...');
      ConnectToDB(db_connection_string);
    });
  });
}

/**
 * Функция создания базы данных. Вызывается после ConnectToDB(db_connection_string). 
 * Если база существует, а также необходимые в ней коллекции - ничего не произойдет.
 * @return {Promise<void>}
 */
async function CreateDB() {
  if(db) {
    const exist_collections = await db.collections();
    const exist_collections_names = [];
    exist_collections.forEach(it => {
      exist_collections_names.push(it.collectionName);
    });
    for(const collection in JSON_Schemes) {
      const obj = JSON_Schemes[collection];
      delete(obj.name);
      if(!exist_collections_names.includes(collection)) {
        db.createCollection(collection, {
            validator: {
              $jsonSchema: obj
            }
          }
        );
      }
    }
  } else {

  }
}

//#endregion

/**
 * Получить пользователя из базы данных по логину
 * @param {string} userLogin логин пользователя
 * @returns {Promise<IUser>} Возвращает пользователя, зарегистрированного в базе данных
 */
export function GetUserByLogin(userLogin) {
  return new Promise((resolve, reject) => {
    if(users) {
      //@ts-ignore
      users.findOne({login: userLogin}).then(u => {
        //@ts-ignore
        /**@type {IUser}*/const user = u;
        resolve(user);
      });
    } else {
      reject('Необходимо подключиться к базе данных');
    }
  });
}

//#region Authority Functions

/**
 * Проверка существования токена доступа или токена обновления в базе данных
 * @param {string} token токен, который необходимо проверить
 * @returns {Promise<boolean>} Возвращает "true", если токен есть в базе, иначе "false"
 */
export function IsTokenExists(token) {
  return new Promise((resolve, reject) => {
    if(authorizes) {
      //@ts-ignore
      /**@type {mongo.WithId<mongo.Document>[]}*/const auths = authorizes.find({$or: [
        {access_token: token},
        {refresh_token: token}
        // {$elemMatch: {access_token: token}},
        // {$elemMatch: {refresh_token: token}}
      ]});
      auths.length > 0 ? resolve(true) : resolve(false);
    } else {
      reject('Необходимо подключиться к базе данных');
    }
  });
}

/**
 * 
 * @param {{newTokens:ITokens, old_refresh_token:string}} object 
 */
export function UpdateTokensByRefreshToken(object) {
  const newTokens = object.newTokens;
  const old_refresh_token = object.old_refresh_token;

  return new Promise((resolve, reject) => {
    if(authorizes) {
      //@ts-ignore
      authorizes.findOneAndUpdate({
        refresh_token: old_refresh_token
      }, 
      {
        //@ts-ignore
        tokens: {
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token
        }
      })
      .then(() => resolve(serverConfigs.SUCCESS_MSG))
      .catch((e) => reject(e.message));
    } else {
      reject('Необходимо подключиться к базе данных');
    }
  });
}

/**
 * Добавить авторизацию
 * @param {{userData:IUser,tokens:ITokens,userAgent:string,ip_port:string}} object 
 * @returns {Promise<string>}
 */
export function AddAuthorize(object) {
  const userData = object.userData;
  const tokens = object.tokens;
  const userAgent = object.userAgent;
  const ip_port = object.ip_port;

  return new Promise((resolve, reject) => {
    if(authorizes) {
      authorizes.count({}, (err, number) => {
        /**@type {bigint}*/const id = number ? BigInt(number) : BigInt(1);
        
        const authorize = new Authorize({
          tokens: tokens,
          ip_port: ip_port,
          login: userData.login,
          user_agent: userAgent,
          date: new Date().toUTCString(),
          auth_id: id
        });
        //@ts-ignore
        authorizes.insertOne(authorize)
        .then(() => resolve(serverConfigs.SUCCESS_MSG))
        .catch((e) => reject(e.message));
      });
    } else {
      reject('Необходимо подключиться к базе данных');
    }
  });
}

/**
 * 
 * @param {{login:string, pass:string}} user 
 */
export function CreateNewUser(user) {
  if (users) {
    //@ts-ignore
    users.count({}, (err, number) => {
      /**@type {bigint}*/const id = number ? BigInt(serverConfigs.START_USER_ID + number) : BigInt(serverConfigs.START_USER_ID);

      //@ts-ignore
      users.findOne({id: id}).then((res) => {
        if (!res) {
          const passHash = GetHashString(user.pass);
          const newUser = new User({id, login:user.login, passHash});
          // const a = newUser.getPublicFields();
          // newUser.getPublicFields
          // users.insertOne(newUser);
        }
      });
    });
  } else {
    
  }
}

/**
 * Получить объект авторизации по токену
 * @param {string} token 
 * @returns {Promise<IAuthorize>} Возвращает объект авторизации
 */
export function GetAuthByToken(token) {
  return new Promise((resolve, reject) => {
    if(authorizes) {
      //@ts-ignore
      /**@type {IAuthorize}*/const auth = authorizes.findOne({$or: [
        {access_token: token},
        {refresh_token: token}
      ]});
      resolve(auth);
    } else {
      reject('Необходимо подключиться к базе данных');
    }
  });
}

//#endregion