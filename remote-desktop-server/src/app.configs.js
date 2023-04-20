export const appConfigs = {
  recorderCodec: 'video/webm;codecs=vp9,opus',
  recorderTimeSlice: 300,

  SettingsFile: './settings.json',
  SocketIOClientFileScriptPath: './socket.io.client.js',
  SocketConnectionPath: '/socket',

  apiPath: '/api',

  checkServerPingRestAPIPath: '/ping',
  checkServerPingRestAPIMethod: 'POST',
  checkServerPingRestAPIRequest: 'ping',
  checkServerPingRestAPIResponse: 'pong',
  checkServerTime: 10000,
}