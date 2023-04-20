const apiPath = "/api";

enum AJAXMethods {
  POST = "POST",
  GET = "GET",
}

const SUCCESS_MSG = 'ok';

export enum serverAPIPath {
  auth = "/auth",
  registration = "/registration",
  checkCompForAccess = "/checkCompForAccess",
  connectToComp = "/connectToComp",
}

interface ServerAPI {
  [serverAPIPath.auth](userdata: { login: string; pass: string; }): Promise<boolean>;
  [serverAPIPath.registration](userdata: { login: string; pass: string; }): Promise<boolean|string>;
  [serverAPIPath.checkCompForAccess](compName: string): Promise<boolean>;
  [serverAPIPath.connectToComp](compData: import('@/store/state').Connection): Promise<boolean>;
}

export const serverAPI: ServerAPI = {
  [serverAPIPath.auth](userdata: { login: string; pass: string; }): Promise<boolean> {
    return new Promise((resolve, reject) => {

      fetch(apiPath + serverAPIPath.auth, {
        method: AJAXMethods.POST,
        body: JSON.stringify(userdata),
      }).then((res) => res.text()).then(text => {
        if (text === SUCCESS_MSG) {
          resolve(true);
        } else {
          resolve(false);
        }
      });

    });
  },
  [serverAPIPath.registration](userdata: { login: string; pass: string; }): Promise<boolean|string> {
    return new Promise((resolve, reject) => {

      fetch(apiPath + serverAPIPath.registration, {
        method: AJAXMethods.POST,
        body: JSON.stringify(userdata),
      }).then((res) => res.text()).then(text => {
        if (text === SUCCESS_MSG) {
          resolve(true);
        } else {
          resolve(text);
        }
      });

    });
  },
  [serverAPIPath.checkCompForAccess](compName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      
      fetch(apiPath + serverAPIPath.checkCompForAccess, {
        method: AJAXMethods.POST,
        body: compName,
      }).then((res) => res.text()).then(text => {
        if(text === "true") {
          resolve(true);
        } else {
          resolve(false);
        }
      });

    });
  },
  [serverAPIPath.connectToComp](compData: import('@/store/state').Connection): Promise<boolean> {
    return new Promise((resolve, reject) => {
      
      fetch(apiPath + serverAPIPath.connectToComp, {method:AJAXMethods.POST, body:JSON.stringify(compData)})
      .then(res => res.text())
      .then(text => {
        if(text === 'ok') {
          resolve(true);
        } else {
          resolve(false);
        }
      });

    });
  },
};

export const socketPath = '/socket';

export enum SocketEvents {
  
}
