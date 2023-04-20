// @ts-check
'use strict';

/**
 * @typedef {{bsonType:string, required:string[], properties:any, name:string}} Scheme
 * @type {{users:Scheme,authorizes:Scheme}}
 */
export const JSON_Schemes = {
  users: {
    bsonType: 'object',
    required: ['id', 'login', 'passHash', 'avatar', 'preview', 'status', 'color_settings'],
    properties: {
      id: {
        bsonType: 'long',
        description: 'Уникальный идентификатор пользователя',
      },
      login: {
        bsonType: 'string',
        description: 'Логин пользователя',
      },
      passHash: {
        bsonType: 'string',
        description: 'SHA512 от пароля пользователя',
      },
      avatar: {
        bsonType: 'string',
        description: 'Относительный путь к картинке аватара пользователя',
      },
      preview: {
        bsonType: 'string',
        description: 'Относительный путь к картинке превью-страницы пользователя',
      },
      status: {
        bsonType: 'string',
        description: 'Описание страницы пользователя / статус',
      },
      color_settings: {
        bsonType: 'object',
        description: 'Цветовая схема пользователя',
        required: ['primary_color', 'primary_shadow', 'secondary_color', 'secondary_shadow', 'font_color', 'back_color', 'theme_color', 'font_shadow', 'back_shadow'],
        properties: {
          primary_color: {
            bsonType: 'string',
            description: 'Основной цвет акцента',
          },
          primary_shadow: {
            bsonType: 'string',
            description: 'Тень основного цвета акцента (для поведения при наведении или для поведения с целью обращения внимания пользователя)',
          },
          secondary_color: {
            bsonType: 'string',
            description: 'Второстепенный цвет акцента',
          },
          secondary_shadow: {
            bsonType: 'string',
            description: 'Тень второстепенного цвета акцента',
          },
          font_color: {
            bsonType: 'string',
            description: 'Цвет текста',
          },
          font_shadow: {
            bsonType: 'string',
            description: 'Цвет тени текста (при наведении или для акцента на каком-либо тексте)',
          },
          back_color: {
            bsonType: 'string',
            description: 'Цвет заднего фона, на котором расположены различные контейнеры',
          },
          back_shadow: {
            bsonType: 'string',
            description: 'Цвет тени заднего фона, на котором расположены различные контейнеры (при наведении на контейнеры или ацента на каком-либо контейнере)',
          },
          theme_color: {
            bsonType: 'string',
            description: 'Цвет контейнеров',
          }
        }
      },
    },
    name: 'users',
  },
  authorizes: {
    bsonType: 'object',
    required: ['auth_id', 'login', 'tokens',  'date', 'user_agent', 'ip_port'],
    properties: {
      auth_id: {
        bsonType: 'long',
        description: 'Уникальный идентификатор объекта авторизации',
      },
      login: {
        bsonType: 'string',
        description: 'Логин пользователя',
      },
      tokens: {
        bsonType: 'object',
        description: 'Объект пары токенов',
        required: ['login', 'access_token', 'access_token_date', 'refresh_token', 'refresh_token_date'],
        properties: {
          login: {
            bsonType: 'string',
            description: 'Логин пользователя',
          },
          access_token: {
            bsonType: 'string',
            description: 'Токен доступа к данным',
          },
          access_token_date: {
            bsonType: 'string',
            description: 'Дата, в течение которой дейсвителен токен доступа',
          },
          refresh_token: {
            bsonType: 'string',
            description: 'Токен обновления пары токенов',
          },
          refresh_token_date: {
            bsonType: 'string',
            description: 'Дата, в течение которой дейсвителен токен обновления',
          },
        },
      },
      date: {
        bsonType: 'string',
        description: 'Дата создания объекта авторизации (дата авторизации)',
      },
      user_agent: {
        bsonType: 'string',
        description: 'Данные от браузера пользователя',
      },
      ip_port: {
        bsonType: 'string',
        description: 'ip-адрес пользователя',
      },
    },
    name: 'authorizes',
  }
}

/**
 * Сущность пользовательских настроек цветового оформления
 * @constructor
 * @param {{
 *   primary_color?:string, 
 *   primary_shadow?:string, 
 *   secondary_color?:string, 
 *   secondary_shadow?:string, 
 *   font_color?:string, 
 *   back_color?:string,
 *   theme_color?:string, 
 *   font_shadow?:string, 
 *   back_shadow?:string
 * }} object
 */
export function UserColorSettings(object) {
  object.hasOwnProperty('primary_color') ? this.primary_color = object.primary_color : this.primary_color = '#ff5599';
  object.hasOwnProperty('primary_shadow') ? this.primary_shadow = object.primary_shadow : this.primary_shadow = '#932451';
  object.hasOwnProperty('secondary_color') ? this.secondary_color = object.secondary_color : this.secondary_color = '#ffd700';
  object.hasOwnProperty('secondary_shadow') ? this.secondary_shadow = object.secondary_shadow : this.secondary_shadow = '#8f7a09';
  object.hasOwnProperty('font_color') ? this.font_color = object.font_color : this.font_color = '#ffffff';
  object.hasOwnProperty('back_color') ? this.back_color = object.back_color : this.back_color = '#222222';
  object.hasOwnProperty('theme_color') ? this.theme_color = object.theme_color : this.theme_color = '#333333';
  object.hasOwnProperty('font_shadow') ? this.font_shadow = object.font_shadow : this.font_shadow = '#777777';
  object.hasOwnProperty('back_shadow') ? this.back_shadow = object.back_shadow : this.back_shadow = '#111111';
}

/**
 * Сущность авторизации
 * @constructor
 * @param {IAuthorize} object 
 */
export function Authorize(object) {
  this.auth_id = object.auth_id;
  this.login = object.login;
  this.tokens = object.tokens;
  this.date = object.date;
  this.user_agent = object.user_agent;
  this.ip_port = object.ip_port;
}

/**
 * Сущность пользователя
 * @constructor
 * @property {IUserPublic} getPublicFields
 * @param {IUser} object
 */
export function User(object) {
  this.id = object.id;
  this.login = object.login;
  this.passHash = object.passHash;
  object.hasOwnProperty('avatar') ? this.avatar = object.avatar : this.avatar = 'default';
  object.hasOwnProperty('status') ? this.status = object.status : this.status = '';
  object.hasOwnProperty('preview') ? this.preview = object.preview : this.preview = 'default';
  object.hasOwnProperty('color_settings') ? this.color_settings = object.color_settings : this.color_settings = new UserColorSettings({});

  /**
   * 
   * @returns {{
   *   id:bigint,
   *   login:string, 
   *   avatar:string, 
   *   preview:string, 
   *   status:string,
   *   color_settings:UserColorSettings
   * }}
   */
  this.getPublicFields = function() {
    /**@type {IUserPublic}*/return {
      id: this.id,
      login: this.login,
      //@ts-ignore
      avatar: this.avatar,
      //@ts-ignore
      preview: this.preview,
      //@ts-ignore
      status: this.status,
      //@ts-ignore
      color_settings: this.color_settings,
    }
  }
}

/**
 * Сущность сообщения пользователя в личном диалоге или беседе
 * @constructor
 * @param {{
 *   id:number, 
 *   date?:string, 
 *   text?:string, 
 *   owner:number, 
 *   views?:Array<number>,
 *   audios?:Array<number>, 
 *   images?:Array<number>, 
 *   videos?:Array<number>,
 *   files?:Array<number>,
 * }} object 
 */
export function Message(object) {
  this.id = object.id;
  object.hasOwnProperty('date') ? this.date = object.date : this.date = new Date(0).toUTCString();
  object.hasOwnProperty('text') ? this.text = object.text : this.text = '';
  this.owner = object.owner;
  object.hasOwnProperty('views') ? this.views = object.views : this.views = [];
  object.hasOwnProperty('audios') ? this.audios = object.audios : this.audios = [];
  object.hasOwnProperty('images') ? this.images = object.images : this.images = [];
  object.hasOwnProperty('videos') ? this.videos = object.videos : this.videos = [];
  object.hasOwnProperty('files') ? this.files = object.files : this.files = [];

  function isDate(dateStr) {
    return !isNaN(new Date(dateStr).getDate());
  }
}

/**
 * @constructor
 * @param {{
 *   userid:number, 
 *   ip:string, 
 *   date:string, 
 *   device:string
 * }} object 
 */
export function Login(object) {
  this.userid = object.userid;
  this.ip = object.ip;
  this.date = object.date;
  this.device = object.device;
}

/**
 * @constructor
 * @param {{}} object
 */
export function Contact(object) {

}

/**
 * Сущность музыки
 * @constructor
 * @param {{
 *   id:number, 
 *   date?:string, 
 *   singers?:Array<number>, 
 *   name:string,  
 *   preview?:string, 
 *   relative_path:string
 * }} object 
 */
export function Audio(object) {
  this.id = object.id;
  object.hasOwnProperty('date') ? this.date = object.date : this.date = new Date().toUTCString();
  object.hasOwnProperty('singers') ? this.singers = object.singers : this.singers = ['Неизвестно'];
  this.name = object.name;
  object.hasOwnProperty('preview') ? this.preview = object.preview : this.preview = 'default';
  this.relative_path = object.relative_path;
}

/**
 * @constructor
 * @param {{
 *   id:number, 
 *   avatar?:string,
 *   name:string
 * }} object 
 */
export function Singer(object) {
  this.id = object.id;
  object.hasOwnProperty('avatar') ? this.avatar = object.avatar : this.avatar = 'default';
  this.name = object.name;
}

//#region Typedefs

/**
 * @typedef {{
 *   id:bigint, 
 *   login:string,  
 *   avatar:string, 
 *   preview:string, 
 *   status:string,
 *   color_settings:UserColorSettings
 * }} IUserPublic
 */

/**
 * @typedef {{
 *   id:bigint, 
 *   login:string, 
 *   passHash:string, 
 *   avatar?:string, 
 *   preview?:string, 
 *   status?:string,
 *   color_settings?:UserColorSettings,
 * }} IUser
 */

/**
 * @typedef {{
 *   login:string,
 *   access_token:string,
 *   refresh_token:string,
 *   access_token_date:string,
 *   refresh_token_date:string
 * }} ITokens
 */

/**
 * @typedef {{
 *   auth_id:bigint, 
 *   login:string,
 *   tokens: ITokens
 *   date:string, 
 *   user_agent:string, 
 *   ip_port:string,
 * }} IAuthorize
 */



//#endregion
