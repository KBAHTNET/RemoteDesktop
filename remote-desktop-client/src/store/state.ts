import { Socket } from "socket.io-client";

export interface Connection {
  name: string;
  pass?:string;
  conMethdod: "streaming" | "image sourcing";
  os: "windows" | "linux";
  fps?: number;
  quality?: number;
}

export const state = {
  socket: null as Socket|null,
  mediaObjet: {
    source: new MediaSource(),
    buffer: null,
    url: null,
    reInitingBuffer: true,
    isInitMediaSource: false,
    // isMediaSourceOpened: false,
    queue: []
  } as {source:MediaSource,buffer:SourceBuffer|null, url:string|null, isInitMediaSource:boolean, reInitingBuffer:boolean, queue:Array<any>},
  videoCaptureContainer: null as HTMLVideoElement|null,
  imageCaptureContainer: null as HTMLImageElement|null,
  audioCaptureContainer: null as HTMLAudioElement|null,

  userdata: {login:'', pass: ''} as {login:string,pass:string},
  connectionsHistory: [
    {
      name: "WIN-VSETJITQ0C2",
      os: "windows",
      conMethdod: "image sourcing",
      fps: 30,
      quality: 40,
    },
    {
      name: "Ubunti123",
      os: "linux",
      conMethdod: "streaming",
    },
  ] as Connection[],
}

export type State = typeof state