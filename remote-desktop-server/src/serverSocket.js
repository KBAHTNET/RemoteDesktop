// @ts-check
'use strict'

import * as http2 from 'http2';

import { appConfigs } from './app.configs'
import { socketEvents } from './socket-events';
import { Server, Socket } from 'socket.io'

//@ts-ignore
let serverio;
const socketClients = {};
export const socketTargets = {};
let pingActiveClients = new Set();

/**
 * 
 * @param {http2.Http2SecureServer} server 
 */
export function InitServerSocket(server) {
  //@ts-ignore
  serverio = new Server(server);
  serverio.of(appConfigs.SocketConnectionPath).on('connection', socket => {
    socket.once('connect', () => {
      console.log(socket);
    });

    socket.emit(socketEvents.checkType);
    socket.once(socketEvents.checkType, (socketResponse) => {

      //#region Client Socket

      if(socketResponse.toString() === socketEvents.checkType_ClientResponse) {

        socket.on(socketEvents.requestCapture, () => {
          socket.broadcast.to(Array.from(socket.rooms)).emit(socketEvents.requestCapture);
        });

        socket.once('disconnect', () => {
          try{
            socket.broadcast.to(Array.from(socket.rooms)).emit(socketEvents.clientDisconnect, socket.id);
            console.log('socket disconnect and emit');
          }
          catch(e) {
            serverio.of(appConfigs.SocketConnectionPath).emit(socketEvents.clientDisconnect, socket.id);
            console.log('socket disconnect and server emit');
          }
          
          socketClients[socket.id] = null;
          delete(socketClients[socket.id]);
          socket.disconnect(true);
        });

        socket.on(socketEvents.canUserConnectToTarget, (userData) => {
          if(userData.name in socketTargets) {
            /***@type {Socket}*/const target = socketTargets[userData.name];
            target.emit(socketEvents.canUserConnectToTarget, {...userData, clientID: socket.id});
          } else {
            socket.emit(socketEvents.canUserConnectToTarget, socketEvents.canConnectNegativeResponse);
          }
        });
        
        socket.on(socketEvents.targetPing, (response) => {
          if(response == socketEvents.targetPingResponse) {
            pingActiveClients.add(socket.id);
          }
        });

        socketClients[socket.id] = socket;
      }

      //#endregion

      //#region Target Socket

      if(socketResponse.toString() === socketEvents.checkType_TargetResponse) {
        
        // socket.once('disconnect', () => {
          // try{
          //   socket.broadcast.to(Array.from(socket.rooms)).emit(socketEvents.clientDisconnect, socket.id);
          //   console.log('socket disconnect and emit');
          // }
          // catch {
          //   serverio.emit(socketEvents.clientDisconnect, socket.id);
          //   console.log('socket disconnect and server emit');
          // }
        
          // socket.disconnect(true);
        // });
        
        socket.on(socketEvents.requestCapture, (result) => {
          if(result) {
            socket.broadcast.to(Array.from(socket.rooms)).emit(socketEvents.requestCapture, true);
          }
        });

        socket.emit(socketEvents.targetID);
        socket.once(socketEvents.targetID, (id) => {
          const targetID = id.toString();
          socketTargets[targetID] = socket;
          socket.join(targetID);

          socket.once('disconnect', () => {
            socket.disconnect(true);
            serverio.in(targetID).disconnectSockets(true);

            for (const key in socketTargets) {
              if(socketTargets[key].id == socket.id) {
                socketTargets[key] = null;
                delete(socketTargets[key]);
                break;
              }
            }
          });

          socket.on(socketEvents.responseCapture, (data) => {
            // serverio.to(targetID).emit(socketEvents.responseCapture, data);
            // serverio.sockets.in(targetID).emit(socketEvents.responseCapture, data);
            // const rooms = socket.rooms;
            socket.broadcast.to(Array.from(socket.rooms)).emit(socketEvents.responseCapture, data);
          });

          socket.on(socketEvents.canUserConnectToTarget, (response) => {
            /**@type {{result:string,clientID:string, channel:string}}*/const data = response;
  
            if(data.clientID in socketClients && data.result == socketEvents.canConnectPositiveResponse) {
              /** @type {Socket}*/const clientSocket = socketClients[data.clientID];
              clientSocket.join(data.channel);
              clientSocket.emit(socketEvents.canUserConnectToTarget, socketEvents.canConnectPositiveResponse);
              //create logs later [ip:clientName connected to targetID]
            } else if(data.clientID in socketClients && data.result == socketEvents.canConnectNegativeResponse){
              //create logs later [ip:clientName not connected to targetID]
              /**@type {Socket}*/const clientSocket = socketClients[data.clientID];
              clientSocket.emit(socketEvents.canUserConnectToTarget, socketEvents.canConnectNegativeResponse);
            } else {
              //create logs later [ip:clientName and targetID call some error]
            }
          });
  
          socket.on(socketEvents.targetPing, (request) => {
            if(request == socketEvents.targetPingRequest) {
              socket.broadcast.to(Array.from(socket.rooms)).emit(socketEvents.targetPing);
  
              setTimeout(() => {
                console.log(pingActiveClients);
                socket.emit(socketEvents.targetPing, Array.from(pingActiveClients));
                pingActiveClients = new Set();
              }, appConfigs.checkServerTime / 2);
            }
          });
        });
      }

      //#endregion

    })
  });
}