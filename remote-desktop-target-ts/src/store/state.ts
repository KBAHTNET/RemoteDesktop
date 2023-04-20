import { Socket } from "socket.io-client"

export const state = {
  captureStream: null as MediaStream|null,
  streamRecorder: null as MediaRecorder|null,
  socket: null as Socket|null,
  socketPingInterval: setInterval(() => {}, 100000000000000),
  activeClients: [] as Array<{name:string, id:string}>,
}

export type State = typeof state