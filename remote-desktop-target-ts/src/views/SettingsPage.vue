<template>
  <div class="settings-wrapper" id="settings" :key="keyToReRender">
    <div class="target-connection_options">
      <div class="name">
        <FlatInput label="Имя компьютера" :value="targetName" v-model:value="targetName"/>
      </div>
      <div class="pass">
        <FlatInput label="Пароль" :value="targetPass" v-model:value="targetPass"/>
      </div>
    </div>
    <div class="server-connection">
      <div class="ip">
        <FlatInput label="Адрес сервера" :value="server" v-model:value="server"/>
      </div>
      <div class="port">
        <FlatInput
          label="Порт подключения"
          :value="port.toString()"
          @update:value="updatePort"
        />
      </div>
      <div
        class="connection-result"
        :style="'color:' + connectionResultColor + ';box-shadow: 0 0 4px 2px ' + connectionResultColor + ';'"
      >
        {{ connectionResultText }}
      </div>
    </div>
    <div class="setting-item more-function" ref="screen">
      <Toggle
        class="toggle"
        :color="toggleColorSettings"
        v-model:value="isFullControl"
      />
      <div class="text">Управление компьютером</div>
      <div class="added-text">
        {{ isFullControlText[isFullControl.toString()] }}
      </div>
      <div class="added-functionality" @click="toggleMoreScreenSettings">
        <img
          src="@/assets/right-arrow.svg"
          alt=""
          v-if="!isShowMoreScreenSettings"
        />
        <select
          @change="setScreenSource"
          @click.stop="getScreenSources()"
          class="select-capture"
          v-show="isShowMoreScreenSettings && screenSources?.length > 0"
        >
          <option
            v-for="screen in screenSources"
            :key="screen.id"
            :selected="screen.id === screenSources[0].id ? true : false"
          >DisplayID:{{ screen.display_id}} Name:{{ screen.name }} ID:{{screen.id}} 
          </option>
        </select>
        <video
          @click.stop
          class="capture-screen"
          id="capture"
          v-show="isShowMoreScreenSettings"
        ></video>
      </div>
    </div>
    <div class="setting-item more-function" ref="audio">
      <Toggle
        class="toggle"
        :color="toggleColorSettings"
        v-model:value="isTranslateSound"
      />
      <div class="text">Транслирование звука</div>
      <div class="added-text">
        {{ isTranslateSoundText[isTranslateSound.toString()] }}
      </div>
      <div class="added-functionality" @click="toggleMoreAudioSettings">
        <img
          src="@/assets/right-arrow.svg"
          alt=""
          v-if="!isShowMoreAudioSettings"
        />
        <div class="text" v-if="isShowMoreAudioSettings" @click.stop>
          shjkvgjkdfsvhgjkfsdvgjkbvhjksdvghjksd
        </div>
      </div>
    </div>
    <div class="setting-item">
      <Toggle
        class="toggle"
        :color="toggleColorSettings"
        v-model:value="isMultiConnection"
      />
      <div class="text">Множественное подключение</div>
      <div class="added-text">
        {{ isMultiConnectionText[isMultiConnection.toString()] }}
      </div>
    </div>
    <div class="setting-item">
      <Toggle
        class="toggle"
        :color="toggleColorSettings"
        v-model:value="isShowCursorsConnection"
      />
      <div class="text">Отображение курсора и никнейма подключенных</div>
      <div class="added-text">
        {{ isShowCursorsConnectionText[isShowCursorsConnection.toString()] }}
      </div>
    </div>
    <div class="setting-item">
      <Toggle
        class="toggle"
        :color="toggleColorSettings"
        v-model:value="isUnControlAccess"
      />
      <div class="text">Неконтролируемый доступ</div>
      <div class="added-text">
        {{ isUnControlAccessText[isUnControlAccess.toString()] }}
      </div>
    </div>
    <div
      class="modal-change_settings showModalAnim"
      v-show="isChangeSettings && !isHideModal"
    >
      <div class="hide-button" @click="hideModal" ref="hideBtn">
        <img
          src="@/assets/right-arrow.svg"
          alt=""
          @click.prevent="
            () => {
              isHideModal = true;
            }
          "
        />
      </div>
      <div class="title">Настройки были изменены. Принять изменения?</div>
      <div class="buttons">
        <div class="accept" @click="acceptNewSettings">Принять</div>
        <div class="cancel" @click="cancelSettings">Отклонить</div>
      </div>
    </div>
    <div
      class="modal-change_settings_hide"
      v-if="isChangeSettings && isHideModal"
      @click="
        () => {
          isHideModal = false;
        }
      "
    >
      <img
        src="@/assets/right-arrow.svg"
        alt=""
        @click.stop="
          () => {
            isHideModal = false;
          }
        "
      />
    </div>
  </div>
  <SuccessWindow :text="'Настройки успешно применены'" ref="successWindow" />
  <ErrorWindow ref="errorWindow" />
</template>

<script lang="ts">

import Toggle from "@/components/ToggleComponent/toggle.vue";
import FlatInput from "@/components/FlatInput.vue";
import SuccessWindow from "@/components/SuccessWindow.vue";
import ErrorWindow from "@/components/ErrorWindow.vue";
import { defineComponent } from "@vue/runtime-core";
import { ActionTypes } from "@/store/action-types";
import { MutationTypes } from "@/store/mutation-types";
import { DesktopCapturerSource } from "electron";
import * as events from "@/ipc-events";
import * as appConfigs from "@/app.constants";
import * as socketEvents from '@/socket-events';


export default defineComponent({
  components: {
    Toggle,
    FlatInput,
    SuccessWindow,
    ErrorWindow,
  },
  data: () => {
    return {

      targetName: '',
      targetPass: '',

      keyToReRender: 0 as number,

      server: "" as string,
      port: 0 as number,

      checkServerInterval: null as number | null,
      socketServerInterval: null as number | null,

      connectionResultText: "" as string,
      connectionResultColor: "" as string,
      connectionResult: false as boolean,

      screenSources: [] as Array<DesktopCapturerSource>,
      reInitRecorder: false as boolean,

      toggleColorSettings: { checked: "#12e96d", unchecked: "#e73763" },
      isFullControl: false as boolean,
      isTranslateSound: false as boolean,
      isMultiConnection: false as boolean,
      isShowCursorsConnection: false as boolean,
      isUnControlAccess: false as boolean,

      isChangeSettings: false as boolean,
      initSettings: false as any,
      isInit: false as boolean,
      isHideModal: false as boolean,

      isFullControlText: {
        true: "Подключенный может полностью управлять этим компьютером",
        false:
          "Данное подключение можно использовать лишь для демонстрации экрана",
      } as any,
      isTranslateSoundText: {
        true: "Вместе с изображение передается и звук с звукового выхода",
        false:
          "Звук не передается, т.е. подключенный может видеть лишь демонстрацию экрана без звука",
      } as any,
      isMultiConnectionText: {
        true: "Этим компьютером могут управлять несколько пользователей",
        false:
          "Этот компьютер поддерживает лишь одно подключение. Если кто-то следующий попытается подключится, произойдет автоматичеcкое отклонение подключения.",
      } as any,
      isShowCursorsConnectionText: {
        true: "На этом компьютере можно видеть курсоры подключенных",
        false:
          "Невозможно понять, что делает подключенный и куда наведен его курсор.",
      } as any,
      isUnControlAccessText: {
        true: "Любая попытка подключения будет приниматься автоматически",
        false:
          "Для подключения к этому компьютеру необходимо принять запрос на подключение здесь, во всмплывающем окне.",
      } as any,

      isShowMoreAudioSettings: false as boolean,
      isShowMoreScreenSettings: false as boolean,
    };
  },
  methods: {
    updatePort(val: string) {
      this.port = parseInt(val);
    },
    cancelSettings(e: Event) {
      const el = this.$refs.hideBtn as HTMLElement;
      el.click();

      setTimeout(() => {
        this.targetName = this.initSettings.targetName;
        this.targetPass = this.initSettings.targetPass;
        this.server = this.initSettings.server;
        this.port = this.initSettings.port;
        this.isFullControl = this.initSettings.isFullControl;
        this.isTranslateSound = this.initSettings.isTranslateSound;
        this.isMultiConnection = this.initSettings.isMultiConnection;
        this.isShowCursorsConnection =
          this.initSettings.isShowCursorsConnection;
        this.isUnControlAccess = this.initSettings.isUnControlAccess;

        this.isShowMoreAudioSettings = false;
        this.isShowMoreScreenSettings = false;

        if (this.keyToReRender + 1 > 9) {
          this.keyToReRender = 0;
          return;
        }
        this.keyToReRender++;
      }, 1000);

      setTimeout(() => {
        this.isChangeSettings = false;
        this.isHideModal = false;
      }, 2000);
    },
    acceptNewSettings() {
      const newSettings = {
        targetName: this.targetName,
        targetPass: this.targetPass,
        server: this.server,
        port: this.port,
        isFullControl: this.isFullControl,
        isTranslateSound: this.isTranslateSound,
        isMultiConnection: this.isMultiConnection,
        isShowCursorsConnection: this.isShowCursorsConnection,
        isUnControlAccess: this.isUnControlAccess,
      };
      window.ipc.send(events.acceptNewSettings, JSON.stringify(newSettings));
      window.ipc.once(events.acceptNewSettings, (payload) => {
        const isAcceptNewSettings = (payload == 'true') ? true : false;

        const el = this.$refs.hideBtn as HTMLElement;
        el.click();

        setTimeout(() => {
          this.isChangeSettings = false;
          this.isHideModal = false;
        }, 2000);

        setTimeout(() => {
          if (isAcceptNewSettings) {
            if (this.keyToReRender + 1 > 9) {
              this.keyToReRender = 0;
            } else {
              this.keyToReRender++;
            }

            const succesWidow = this.$refs.successWindow as any;
            succesWidow.ShowWindow();
          } else if (!isAcceptNewSettings) {
            const errorWindow = this.$refs["errorWindow"] as any;
            errorWindow.ShowWindow("Настройки не были применены");
          }
        }, 1000);
      });
    },
    hideModal(e: Event) {
      const el = e.target as HTMLElement;
      const parent = el.parentNode as HTMLElement;
      parent.classList.remove("showModalAnim");
      parent.classList.add("hideModalAnim");
      // debugger;
      setTimeout(() => {
        this.isHideModal = true;
        parent.classList.remove("hideModalAnim");
        parent.classList.add("showModalAnim");
      }, 1100);
    },
    toggleMoreAudioSettings() {
      const audio = this.$refs.audio as HTMLElement;
      if (this.isShowMoreAudioSettings) {
        this.isShowMoreAudioSettings = false;
        const currentStyle = getComputedStyle(audio).gridTemplateRows;
        audio.style.gridTemplateRows = currentStyle
          .split(" ")
          .slice(0, currentStyle.split(" ").length - 1)
          .join(" ");
        audio.style.gridTemplateRows += " 20px";
        const addBtn = audio.querySelector(
          ".added-functionality"
        ) as HTMLElement;
        addBtn.style.backgroundColor = "";
        // console.log(this.$refs.audio.querySelector('.added-functionality'));
      } else {
        this.isShowMoreAudioSettings = true;
        const currentStyle = getComputedStyle(audio).gridTemplateRows;
        audio.style.gridTemplateRows = currentStyle
          .split(" ")
          .slice(0, currentStyle.split(" ").length - 1)
          .join(" ");
        audio.style.gridTemplateRows += " 1fr";
        const addBtn = audio.querySelector(
          ".added-functionality"
        ) as HTMLElement;
        addBtn.style.backgroundColor = "var(--theme-color)";
      }
    },
    toggleMoreScreenSettings() {
      const screenHTMLElement = this.$refs.screen as HTMLElement;
      if (this.isShowMoreScreenSettings) {
        this.isShowMoreScreenSettings = false;
        const currentStyle =
          getComputedStyle(screenHTMLElement).gridTemplateRows;
        screenHTMLElement.style.gridTemplateRows = currentStyle
          .split(" ")
          .slice(0, currentStyle.split(" ").length - 1)
          .join(" ");
        screenHTMLElement.style.gridTemplateRows += " 20px";
        const addBtn = screenHTMLElement.querySelector(
          ".added-functionality"
        ) as HTMLElement;
        addBtn.style.backgroundColor = "";
      } else {
        this.isShowMoreScreenSettings = true;
        const currentStyle =
          getComputedStyle(screenHTMLElement).gridTemplateRows;
        screenHTMLElement.style.gridTemplateRows = currentStyle
          .split(" ")
          .slice(0, currentStyle.split(" ").length - 1)
          .join(" ");
        screenHTMLElement.style.gridTemplateRows += " 1fr";
        const addBtn = screenHTMLElement.querySelector(
          ".added-functionality"
        ) as HTMLElement;
        addBtn.style.backgroundColor = "var(--theme-color)";
      }
    },
    createMediaRecorderFromStream(): void {
      if(this.connectionResult) {
        const socket = this.$store.state.socket;
        // console.log(typeof this.$store.state.captureStream);
        const stream = this.$store.state.captureStream as MediaStream;
        const recorder = new MediaRecorder(stream, {mimeType: appConfigs.recorderCodec});
        recorder.ondataavailable = (e) => {

          if(this.$store.state.activeClients.length > 0) {
            // console.log(e.data);
            console.log('send data');
            if(!this.reInitRecorder) {
              //@ts-ignore
              socket.emit(socketEvents.responseCapture, e.data);
            } else {
              console.log('%c data avaliable but not send, because reInitRecorder = true', 'background-color:red;font-size: 24px;');
            }
          } else {
            console.log('%c data avaliable but not send, because activeClients == 0', 'background-color:red;font-size: 24px;');
          }
        };
        recorder.onerror = () => {
          console.log('%c recorderError', 'background-color:red;font-size: 24px;');
          this.reInitRecorder = true;
          this.createMediaRecorderFromStream();
        };

        recorder.onstop = () => {
          console.log('%c recorderStop', 'background-color:red;font-size: 24px;');

          // recorder.start(appConfigs.recorderTimeSlice);

          // this.reInitRecorder = true;
          // this.createMediaRecorderFromStream();

          // socket.emit(socketEvents.requestCapture, true);
          // setTimeout(() => {
          //   this.createMediaRecorderFromStream();
          // }, 1000);
        };
        this.reInitRecorder = false;
        this.$store.commit(MutationTypes.setStreamRecorder, recorder);
        recorder.start(appConfigs.recorderTimeSlice);
        // return recorder;
      } else {
        // const stream = this.$store.state.captureStream as MediaStream;
        // return new MediaRecorder(stream);
      }      
    },
    async createCaptureStreamFromSource(
      source: DesktopCapturerSource
    ): Promise<void> {
      if(this.isTranslateSound) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            //@ts-ignore it's a custom electron navigator
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id,
            }
          },
          video: {
            //@ts-ignore it's a custom electron navigator
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id,
            }
          }
        });
        this.$store.commit(MutationTypes.setCaptureStream, stream);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            //@ts-ignore it's a custom electron navigator
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id,
            }
          }
        });
        console.log(stream);
        this.$store.commit(MutationTypes.setCaptureStream, stream);
      }
      this.handleCaptureStream();
    },
    async setScreenSource(e: Event|DesktopCapturerSource): Promise<void> {
      let source:DesktopCapturerSource;
      if(e instanceof Event) {
        console.log("setSource");
        const selectElem = e.target as HTMLSelectElement;
        console.log(this.screenSources[selectElem.selectedIndex]);
        source = this.screenSources[selectElem.selectedIndex];
      } else {
        source = e as DesktopCapturerSource;
        console.log('instanceof DesktopCapturerSource');
      }

      await this.createCaptureStreamFromSource(source);

      if(this.$store.state.streamRecorder?.state == "recording") {
        this.$store.state.streamRecorder.stop();
      }
      this.createMediaRecorderFromStream();
    },
    handleCaptureStream(): void {
      const video = document.querySelector("#capture") as HTMLVideoElement;
      if (this.$store.state.captureStream) {
        video.srcObject = this.$store.state.captureStream;
        video.onloadedmetadata = (e) => {
          video.play();
          video.volume = 0;
        };
      }
    },
    getScreenSources(): void {
      this.$store
        .dispatch(ActionTypes.getScreenSources)
        .then((screenSources) => {
          this.screenSources = screenSources;
          console.log((screenSources));
        });
    },
    initSocket():void {
      const socket = window.io(
        `https://${this.server}:${this.port}${appConfigs.SocketConnectionPath}`
      );

      socket.once("disconnect", () => {
        // socket.disconnect(true);
        console.log("close");
        this.$store.commit(MutationTypes.setClientSocket, null);
        if(this.$store.state.streamRecorder?.state == "recording") {
          this.$store.state.streamRecorder.stop();
        }
        this.connectionResult = false;
        this.connectionResultText = "Сервер не доступен для подключения";
        this.connectionResultColor = "red";
      });
      socket.once(socketEvents.checkType, () => {
        socket.emit(socketEvents.checkType, socketEvents.checkType_TargetResponse);
      });
      socket.once(socketEvents.targetID, () => {
        socket.emit(socketEvents.targetID, this.targetName);
      });

      socket.on(socketEvents.canUserConnectToTarget, (userData:{name:string, pass:string, clientID:string, clientName:string}) => {
        console.log('clientTryConnect', userData);
        
        if(this.targetName == userData.name && this.targetPass == userData.pass) {
          // if(this.$store.state.streamRecorder?.state == "recording") {
          //   this.$store.state.streamRecorder?.stop();
          // }
          
          socket.emit(socketEvents.canUserConnectToTarget, {
            channel: this.targetName,
            result: socketEvents.canConnectPositiveResponse, 
            clientID: userData.clientID
          });
          console.log('client connect');
          this.$store.state.activeClients.push({name: userData.clientName, id:userData.clientID});
          console.log(this.$store.state.activeClients);

          // this.createMediaRecorderFromStream();
          
          //create logs later
        } else {
          socket.emit(socketEvents.canUserConnectToTarget, socketEvents.canConnectNegativeResponse);
          //create logs later
        }
      });
      socket.on(socketEvents.requestCapture, () => {
        this.reInitRecorder = true;
        try{
          if(this.$store.state.streamRecorder?.state == "recording") {
            this.$store.state.streamRecorder?.stop();
          }
          socket.emit(socketEvents.requestCapture, true);
          setTimeout(() => {
            this.createMediaRecorderFromStream();
          }, 1000);
          
          // if (this.$store.state.streamRecorder?.state == "recording") {
          //   this.$store.state.streamRecorder.stop();
          // }
          // 
          // this.$store.state.streamRecorder?.start(appConfigs.recorderTimeSlice);
        }
        catch {
          socket.emit(socketEvents.requestCapture, false);
        }
      });
      socket.on(socketEvents.clientDisconnect, (clientID:string) => {
        console.log('client disconnect', clientID);
        const clients = Array.from(this.$store.state.activeClients);
        const disconnectClientIndex = clients.findIndex(x=>x.id==clientID);
        const activeClients = [] as Array<{name:string, id:string}>;
        for (let i = 0; i < clients.length; i += 1) {
          if (i !== disconnectClientIndex) {
            activeClients.push(clients[i]);
          }
        }
        this.$store.state.activeClients = activeClients;
        console.log(this.$store.state.activeClients);
        
      });
      socket.on(socketEvents.targetPing, (activeSockets:Array<string>) => {
        console.log('currentActive', this.$store.state.activeClients);
        console.log('actualActive', activeSockets);
        
        const activeClients = [] as Array<{name:string, id:string}>;
        this.$store.state.activeClients.forEach(it => {
          
          if(activeSockets.includes(it.id) && activeClients.filter((x) => x.id === it.id).length === 0) {
            activeClients.push(it);
          }
        });
        console.log('%c ______________________________', 'background-color:green;');
        console.log(activeClients);
        console.log('%c ______________________________', 'background-color:green;');
        
        this.$store.state.activeClients = activeClients;
      });

      this.$store.commit(MutationTypes.setClientSocket, socket);

      clearInterval(this.$store.state.socketPingInterval);
      this.$store.state.socketPingInterval = setInterval(() => {
        if(this.$store.state.activeClients.length > 0) {
          socket.emit(socketEvents.targetPing, socketEvents.targetPingRequest);
        }
      }, appConfigs.checkServerTime);
    },
  },
  created() {
    this.isChangeSettings = false;
    window.ipc.send(events.checkSettings);
    window.ipc.once(events.checkSettings, (payload) => {
      console.log(payload);
      
      const settings = JSON.parse(payload);

      this.targetName = settings.targetName;
      this.targetPass = settings.targetPass;
      this.server = settings.server;
      this.port = settings.port;
      this.isFullControl = settings.isFullControl;
      this.isTranslateSound = settings.isTranslateSound;
      this.isMultiConnection = settings.isMultiConnection;
      this.isShowCursorsConnection = settings.isShowCursorsConnection;
      this.isUnControlAccess = settings.isUnControlAccess;

      this.keyToReRender += 1;
      this.initSettings = settings;
    });
  },

  async mounted() {

    setTimeout(() => {
      this.isInit = true;
    }, 1000);

    setInterval(async () => {
      console.log("check server connection");
      // if (this.$store.state.socket === null || !this.$store.state.socket?.connected) {
      await fetch(
        `https://${this.server}:${this.port}${appConfigs.checkServerPingRestAPIPath}`,
        {
          method: appConfigs.checkServerPingRestAPIMethod,
          body: appConfigs.checkServerPingRestAPIRequest,
        }
      )
      .then((res) => res.text())
      .then((text) => {
          let initSocket = false;
          if (this.$store.state.socket && this.$store.state.socket.connected) {
            initSocket = true;
          }
          if (!this.connectionResult) {
            initSocket = false;
          }
          if (text === appConfigs.checkServerPingRestAPIResponse) {
            this.connectionResult = true;
            this.connectionResultText = "Соединение установлено";
            this.connectionResultColor = "green";

            if (!initSocket) {
              this.initSocket();
            }
          } else {
            this.connectionResult = false;
            this.connectionResultText =
              "Соединение установлено, но возможны ошибки";
            this.$store.commit(MutationTypes.setClientSocket, null);
            if(this.$store.state.streamRecorder?.state == "recording") {
              this.$store.state.streamRecorder.stop();
            }

            this.connectionResultColor = "#ff5800";

            this.$store.state.activeClients.forEach((it,i,arr) => {
              arr.pop();
            });
          }
        })
      .catch((e) => {
          this.connectionResult = false;
          this.connectionResultText = "Сервер не доступен для подключения";
          this.$store.commit(MutationTypes.setClientSocket, null);
          if(this.$store.state.streamRecorder?.state == "recording") {
            this.$store.state.streamRecorder.stop();
          }

          this.connectionResultColor = "red";
          
          this.$store.state.activeClients.forEach((it,i,arr) => {
            arr.pop();
          });

          console.log(e);
        });
      // }
    }, appConfigs.checkServerTime);

    this.$store.dispatch(ActionTypes.getScreenSources)
      .then(async (screenSources) => {
        this.screenSources = screenSources;
        this.setScreenSource(screenSources[0]);
        // await this.createCaptureStreamFromSource(screenSources[0]);
        // if(this.$store.state.streamRecorder?.state == "recording") {
        //   this.$store.state.streamRecorder.stop();
        // }
        // this.createMediaRecorderFromStream();
        // this.handleCaptureStream();
      });
  },
  watch: {
    connectionResult(newValue) {
      if(newValue && this.$store.state.activeClients.length > 0) {
        //@ts-ignore
        this.$store.state.socket.emit(socketEvents.requestCapture, true);
        setTimeout(() => {
          this.createMediaRecorderFromStream();
        }, 1000);
      }
    },
    targetName() {
      if (this.isInit)
        this.isChangeSettings = true;
    },
    targeetPass() {
      if (this.isInit)
        this.isChangeSettings = true;
    },
    server() {
      if (this.isInit)
        this.isChangeSettings = true;
    },
    port() {
      if (this.isInit)
        this.isChangeSettings = true; 
    },
    isFullControl() {
      if (this.isInit) this.isChangeSettings = true;
    },
    isTranslateSound() {
      if (this.isInit) this.isChangeSettings = true;
    },
    isShowCursorsConnection() {
      if (this.isInit) this.isChangeSettings = true;
    },
    isUnControlAccess() {
      if (this.isInit) this.isChangeSettings = true;
    },
    isMultiConnection() {
      if (this.isInit) this.isChangeSettings = true;
    },
  },
});
</script>

<style lang="scss" scoped>
%select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}
.settings-wrapper {
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  position: relative;
  padding-bottom: 10px;
  overflow-y: auto;
  overflow-x: hidden;

  .target-connection_options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-color: var(--theme-color);
    align-items: center;
    justify-items: center;
    margin: 10px;
    border-radius: 10px;
    height: 100px;
    position: relative;

    .name,
    .pass {
      margin: 5px;
    }
  }

  .server-connection {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-color: var(--theme-color);
    align-items: center;
    justify-items: center;
    margin: 10px;
    padding-top: 40px;
    border-radius: 10px;
    height: 120px;
    position: relative;

    .ip,
    .port
    {
      margin: 5px;
    }

    .connection-result {
      font-size: 16px;
      position: absolute;
      top: 3px;
      left: 3px;
      border-radius: 4px;
      padding: 3px;
      margin: 10px;
      transition-duration: .4s;
      @extend %select-none;
    }
  }

  .setting-item {
    /* grid-area: setting; */
    border-style: solid;
    border-color: var(--font-color);
    border-width: 1px;
    margin: 10px 10px 0px 10px;
    padding: 5px;
    display: grid;
    grid-template-columns: 100px 2fr 1fr;
    grid-template-rows: 1fr;
    overflow-y: auto;
    justify-items: center;
    align-items: center;
    border-radius: 10px;
    background-color: var(--theme-color);
    min-height: 120px;
    @extend %select-none;
    transition-duration: 0.4s;

    .text {
      color: var(--font-color);
      font-size: 24px;
      word-break: break-word;
      text-align: justify;
      border-radius: 10px;
    }

    .added-text {
      color: var(--font-shadow);
      text-align: justify;
      margin: 8px;
      overflow-y: auto;
      word-break: break-word;
    }
  }
  .more-function {
    grid-template-columns: 100px 2fr 1fr;
    grid-template-rows: 1fr 20px;
    grid-template-areas: "toggle text addtext" "more more more";
    justify-content: stretch;
    align-content: stretch;

    .toggle {
      grid-area: toggle;
    }

    .text {
      grid-area: text;
    }

    .added-text {
      grid-area: addtext;
    }
    &:hover .added-functionality {
      background-color: var(--back-color);
      svg {
        fill: var(--font-color);
      }
    }
    .added-functionality {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-items: center;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
      transition-duration: 0.4s;
      overflow-y: auto;

      grid-area: more;

      &:hover {
        box-shadow: 0 0 3px 1px var(--primary-shadow);
        background-color: var(--primary-color);
        transition-duration: 0.4s;
        cursor: pointer;

        img {
          border-radius: 0%;
          transition-duration: 0.4s;
          background-color: transparent;
        }
      }

      img {
        height: 100%;
        max-height: 20px;
        max-width: 100%;
        object-fit: contain;
        transform: rotate(90deg);
        background-color: var(--primary-color);
        border-radius: 100%;
        padding: 2px;
        transition-duration: 0.4s;
      }

      .capture-screen {
        min-width: 300px;
        max-width: 95%;
        min-height: 300px;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 0 3px 1px var(--primary-color);
        background-color: var(--back-color);
        padding: 5px;
        margin: 10px;
      }
      .select-capture {
        max-width: 95%;
        margin: 5px;
        color: var(--font-color);
        background-color: var(--back-color);
        font-size: 20px;

        &:hover {
          cursor: pointer;
        }
      }
    }
  }
  .modal-change_settings {
    position: fixed;
    align-self: center;
    justify-self: center;
    // top: 35%;
    left: calc(50% - 150px);
    width: 300px;
    height: 200px;
    background-color: var(--back-color);
    border-radius: 7px;
    display: grid;
    justify-items: stretch;
    align-items: center;
    grid-template-areas: "hide" "title" "buttons";
    grid-template-columns: 1fr;
    grid-template-rows: 30px 1fr 45px;
    box-shadow: 0 0 3px 1px var(--primary-color);
    z-index: 990;
    .title {
      grid-area: title;
      color: var(--font-color);
      font-size: 24px;
      text-align: center;
      margin: 5px;
      @extend %select-none;
    }
    .buttons {
      grid-area: buttons;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr;
      padding: 3px;
      align-self: stretch;

      .accept {
        background-color: rgb(20, 231, 101);
        border-radius: 10px;
        margin: 2px;
        display: grid;
        align-items: center;
        justify-items: center;
        text-align: center;
        @extend %select-none;

        &:hover {
          background-color: rgb(172, 255, 204);
          cursor: pointer;
        }
      }
      .cancel {
        background-color: rgb(241, 37, 105);
        border-radius: 10px;
        margin: 2px;
        display: grid;
        align-items: center;
        justify-items: center;
        text-align: center;
        @extend %select-none;

        &:hover {
          background-color: rgb(255, 106, 155);
          cursor: pointer;
        }
      }
    }

    .hide-button {
      grid-area: hide;
      background-color: var(--theme-color);
      display: grid;
      margin: 3px;
      border-radius: 5px;
      max-height: 20px;
      margin: 5px;
      @extend %select-none;
      img {
        max-height: 20px;
        max-width: 100%;
        width: 100%;
        height: 100%;
        object-fit: contain;
        transform: rotate(-90deg);
      }
    }
    .hide-button:hover {
      background-color: var(--font-shadow);
      cursor: pointer;
    }
  }

  .showModalAnim {
    animation: showModal 1s forwards ease-in-out;
  }
  .hideModalAnim {
    animation: hideModal 1s forwards ease-in-out;
  }
  @keyframes showModal {
    0% {
      top: -500px;
      align-self: none;
    }
    100% {
      top: calc(100% - 230px);
    }
  }

  @keyframes hideModal {
    0% {
      top: calc(100% - 230px);
    }
    100% {
      top: -500px;
    }
  }

  .modal-change_settings_hide {
    position: fixed;
    align-self: center;
    justify-self: center;
    align-self: flex-start;
    left: calc(50% - 20px);
    width: 40px;
    height: 30px;
    border-radius: 10px;
    background-color: var(--primary-color);
    display: grid;
    padding: 5px;
    img {
      height: 100%;
      max-height: 20px;
      max-width: 100%;
      object-fit: contain;
      align-self: center;
      justify-self: center;
      transform: rotate(90deg);
    }
  }
  .modal-change_settings_hide:hover {
    background-color: var(--primary-shadow);
    cursor: pointer;
  }
}
</style>
