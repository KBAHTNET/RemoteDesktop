<template>
  <div class="main-wrapper">
    <div class="nav">
      <MenuIcon :isActivate="isMenuActivate" @click="toggleMenu" class="menuBtn"/>
      <img src="@/assets/remote-access.svg" alt="" @click="openConnectionWindow" @mouseenter="ShowToolTip" @mouseleave="HideToolTip">
      <img src="@/assets/settings.svg" alt="">
      <img @click="requestFullScreen" class="fullscreen" src="@/assets/expand.svg" alt="" v-if="!isFullScreen">
      <img @click="exitFullScreen" class="fullscreen" src="@/assets/minimize.svg" alt="" v-if="isFullScreen">
      <img @click="toggleKeyboard" src="@/assets/keyboard.svg" alt="">
      <div class="authorize-user">{{ currentAcc }}</div>
    </div>
    <div class="left-menu">
      <div class="finder" v-if="isMenuInit">
        <FlatInput label="Поиск"/>
      </div>
      <ConnectionsHistoryList :EmptyElementHeight=80 :connections="$store.state.connectionsHistory" class="connections-list" v-if="isMenuInit && $store.state.connectionsHistory.length > 0"/>
      <div class="info-text" v-if="isMenuInit && $store.state.connectionsHistory?.length === 0">
        История подключений
      </div>
    </div>
    <div class="control-window" @wheel="scroll" @touchstart="touchstart" @touchmove="touchmove">
      <video id="capture" ref="video_capture" v-show="captureMethod === 1" @wheel="scroll"></video>
      <img id="capture" ref="img_capture" v-show="captureMethod === 0">
      <!-- <div class="workground" style="position:absolute" ref="work"></div> -->
    </div>
    <ConnectionWindow @closeWindow="closeConnectionWindow" v-if="isOpenConnectionWindow" class="connection-window"/>
    <div class="tooltip" v-show="showTooltip" ref="tooltip">
      Открыть окно подключения
    </div>
    <!-- <div class="simple-keyboard"></div> -->
    <VirtualKeyBoard @onChange="onChange" @onKeyPress="onKeyPress" class="keyboard" v-if="isShowKeyboard"/>
    <VirtualKeyBoard2 @onChange="onChange" @onKeyPress="onKeyPress" class="keyboard" v-if="isShowKeyboard2"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import MenuIcon from "@/components/MenuIcon.vue";
import ConnectionWindow from "@/components/ConnectionWindow.vue";
import ConnectionsHistoryList from "@/components/ConnectionsList/ConnectionsHistoryList.vue";
import FlatInput from "@/components/FlatInput.vue";
import VirtualKeyBoard from "@/components/VirtualKeyboard_Full.vue";
import VirtualKeyBoard2 from "@/components/VirtualKeyboard2.vue";

const closemenu = require('@/assets/accept.mp3');
const openmenu = require('@/assets/openmenu.mp3');
export default defineComponent({
  components: {
    MenuIcon,
    ConnectionWindow,
    ConnectionsHistoryList,
    FlatInput,
    VirtualKeyBoard,
    VirtualKeyBoard2,
  },
  data: () => {
    return {
      isMenuActivate: true as boolean,
      isMenuInit: true as boolean,
      isOpenConnectionWindow: false as boolean,

      isFullScreen: false,

      showTooltip: false,
      shouldToolTipShow: false,
      initToolTip: false,
      isToolTipClosing: false,
      soundTimer: 0,

      isShowKeyboard: false,
      isShowKeyboard2: false,

      captureMethod: 1 as 0|1,

      observer: null as any,
      observer2: null as any,

      accounts: [] as Array<string>,
      currentAcc: '' as string,
    }
  },
  methods: {
    touchstart(e:TouchEvent) {
      // if(e.touches.length > 1) {
      //   alert(e.touches.length);
      // }
    },
    touchmove(e:TouchEvent) {
      // alert(e.detail.toString());

    // document.body.addEventListener('touchmove', touchmove);
    // document.body.addEventListener('touchstart', touchstart);


    // var startX, startY;

    // function touchstart(e)
    // {
    //     startX = e.touches[0].clientX;
    //     startY = e.touches[0].clientY;
    // }

    // function touchmove(e)
    // {
    //   var deltaX = e.touches[0].clientX - startX,
    //         deltaY = e.touches[0].clientY - startY;


    // console.log('Delta x,y',deltaX, deltaY);
// }
    },
    scroll(e:UIEvent)
    {
      // alert('scroll');
      // if("ontouchstart" in window){
      //   const ev = e as TouchEvent;

      //   //@ts-ignore
      //   ev.target.ontouchstart = (e:TouchEvent) => {
      //     if(e.touches.length > 1) {
      //       alert(e.touches);
      //     }
      //   }

      //   //@ts-ignore


      // }   
    },  
    openConnectionWindow() {
      this.isOpenConnectionWindow = true;
      //@ts-ignore
      document.querySelector('#back-audio').src = openmenu;
      //@ts-ignore
      document.querySelector('#back-audio').currentTime = 0;
      this.soundTimer = setTimeout(() => {
        //@ts-ignore
        document.querySelector('#back-audio').play();
      }, 1000);
    },
    closeConnectionWindow() {
      this.isOpenConnectionWindow = false;
      //@ts-ignore
      document.querySelector('#back-audio').src = closemenu;
      //@ts-ignore
      document.querySelector('#back-audio').currentTime = 0;
      //@ts-ignore
      document.querySelector('#back-audio').play();

    },
    toggleMenu() {

      this.isMenuActivate = !this.isMenuActivate;
      if(this.isMenuActivate) {
        this.$el.querySelector('.left-menu').classList.remove('closed-menu');

        //@ts-ignore
        document.querySelector('#back-audio').src = openmenu;
        //@ts-ignore
        document.querySelector('#back-audio').currentTime = 0;
        setTimeout(() => {
          this.$el.classList.remove('main-wrapper__closed_menu');
          //@ts-ignore
          document.querySelector('.left-menu').style.boxShadow = "inset 0 0 0 0.5px var(--primary-color)";
        }, 400);

        setTimeout(() => {
          //@ts-ignore
          document.querySelector('#back-audio').play();
          this.isMenuInit = true;
        }, 800);
      } else {
        this.isMenuInit = false;
        //@ts-ignore
        document.querySelector('.left-menu').style.boxShadow = "none";
        //@ts-ignore
        document.querySelector('#back-audio').src = closemenu;
        //@ts-ignore
        document.querySelector('#back-audio').currentTime = 0;
        //@ts-ignore
        document.querySelector('#back-audio').play();
        setTimeout(() => {
          this.$el.classList.add('main-wrapper__closed_menu');
          this.$el.querySelector('.left-menu').classList.add('closed-menu');
        }, 400);
      }
    },
    ShowToolTip(e:MouseEvent) {
      setTimeout(() => {
        const tooltip = this.$refs['tooltip'] as HTMLDivElement;
        if(!this.isToolTipClosing) {
          this.shouldToolTipShow = true;

          if(!this.initToolTip) {
            if(!this.showTooltip) {
              tooltip.innerText = '';

              tooltip.style.left = (e.clientX + 10) + 'px';
              tooltip.style.top = (e.clientY + 10) + 'px';
              
              if(parseInt(getComputedStyle(tooltip).left) + parseInt(getComputedStyle(tooltip).width) > window.innerWidth) {
                tooltip.style.left = '';
                tooltip.style.right = '3px';
              }
            }
            
            this.showTooltip = true;
          }
          this.initToolTip = true;
          setTimeout(() => {
            tooltip.innerText = 'Открыть окно подключения';
            this.initToolTip = false;
          }, 900);
        }     
      }, 1000); 
    },
    HideToolTip() {
      const tooltip = this.$refs['tooltip'] as HTMLDivElement;
      this.shouldToolTipShow = false;
      if(!this.initToolTip) {
        // setTimeout(() => {
          
        // }, 100);

        tooltip.innerText = '';

        tooltip.classList.add('close-tooltip');
        this.isToolTipClosing = true;
        this.clearAllTimers();
        setTimeout(() => {
          this.showTooltip = false;
          tooltip.classList.remove('close-tooltip');
          this.isToolTipClosing = false;
        }, 900);
      }
    },
    clearAllTimers() {
      let id = window.setTimeout(() => {}, 0);
      console.log(id);
      while (id) {
        if(id != this.soundTimer) {
          window.clearTimeout(id);
        }
        id--;
      }

      id = window.setInterval(() => {}, 0);
      console.log(id);
      while (id) {
        if(id != this.soundTimer) {
          window.clearInterval(id);
        }
        id--;
      }
    },
    requestFullScreen() {
      const element = document.body;
    // Supports most browsers and their versions.
    //@ts-ignore
      var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

      if (requestMethod) { // Native full screen.
          requestMethod.call(element);
          this.isFullScreen = true;
      } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
          var wscript = new ActiveXObject("WScript.Shell");
          if (wscript !== null) {
              wscript.SendKeys("{F11}");
              this.isFullScreen = true;
          }
      }
    },
    exitFullScreen() {
      try {
        document.exitFullscreen().then(() => {
          this.isFullScreen = false;
        });
        
      }
      catch {
        try {
          //@ts-ignore
          document.webkitExitFullscreen().then(() => {
            this.isFullScreen = false;
          });
        } catch{}
      }
    },
    checkForFullScreen() {
      if(window.innerHeight == screen.height) {
        this.isFullScreen = true;
      } else {
        this.isFullScreen = false;
      }
      console.log(this.isFullScreen);
      
      // if (!window.screenTop && !window.screenY) {
      //   this.isFullScreen = false;
      // } else {
      //   this.isFullScreen = true;
      // }
    },
    toggleKeyboard() {
      if(this.isShowKeyboard || this.isShowKeyboard2) {
        this.isShowKeyboard = false;
        this.isShowKeyboard2 = false;
      } else {
        if(/*window.innerWidth > window.innerHeight && */window.innerWidth >= 1024) {
          this.isShowKeyboard = true;
        } else {
          this.isShowKeyboard2 = true;
          // this.$el.querySelector('.simple-keyboard').style.height = '230px'; 
          setTimeout(() => {
            // this.$el.querySelector('.simple-keyboard').style.height = '230px'; 
            // this.$el.querySelector('.simple-keyboard').style.maxWidth = '300px'; 
          }, 100);
        }
      }
      
    },
    onChange(input:any) {
      //@ts-ignore
      document.querySelector("input").value = input;
      console.log("Input changed", input);
    },

    onKeyPress(button:any) {
      console.log("Button pressed", button);

      /**
       * If you want to handle the shift and caps lock buttons
       */
      if (button === "{shift}" || button === "{lock}") this.handleShift();
    },

    handleShift() {
      //@ts-ignore
      const currentLayout = this.keyboard.options.layoutName;
      const shiftToggle = currentLayout === "default" ? "shift" : "default";

      //@ts-ignore
      this.keyboard.setOptions({
        layoutName: shiftToggle
      });
    },
  },
  mounted() {

    this.$store.state.imageCaptureContainer = this.$refs['img_capture'] as HTMLImageElement;
    this.$store.state.videoCaptureContainer = this.$refs['video_capture'] as HTMLVideoElement;

    document.addEventListener('fullscreenchange', this.checkForFullScreen, false);
    document.addEventListener('mozfullscreenchange', this.checkForFullScreen, false);
    document.addEventListener('MSFullscreenChange', this.checkForFullScreen, false);
    document.addEventListener('webkitfullscreenchange', this.checkForFullScreen, false);
    window.addEventListener('keydown', e => {
      if(e.key === 'F11') {
        e.preventDefault();
      }
    });

    this.accounts = this.$store.getters.getCookie_Accounts;
    this.currentAcc = this.$store.getters.getCookie_CurrentAcc;
    // //@ts-ignore
    // this.keyboard = new Keyboard({
    //   onChange: input => this.onChange(input),
    //   //@ts-ignore
    //   onKeyPress: button => this.onKeyPress(button),
    // });

    //#region Init Virtual Keyboard

    //#endregion
  },
});
</script>

<style lang="scss" scoped>
%select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}

.main-wrapper {
  display: grid;
  width: 100vw;
  height: 100vh;
  background-color: var(--back-color);
  position: relative;
  grid-template-rows: 60px 1fr;
  grid-auto-columns: 300px 1fr;
  grid-template-areas: "nav nav" "menu control";

  justify-content: center;
  align-content: center;
  align-items: stretch;
  justify-items: stretch;

  .nav {
    grid-area: nav;
    background-color: var(--theme-color);
    z-index: 2;
    display: grid;
    align-items: center;
    grid-template-columns: 400px 50px 50px 50px 50px 1fr;
    grid-template-rows: 1fr;
    justify-items: center;
    align-items: center;

    .fullscreen {
      padding: 5px;
      box-shadow: 0 0 0 1px var(--primary-color);
      border-radius: 4px;
      width: 30px; 
      height: 30px;
    }

    img {
      width: 40px;
      filter: brightness(10);
      object-fit: contain;
      padding: 5px;
      transition-duration: .2s;
      @extend %select-none;

      &:hover {
        filter: brightness(1) drop-shadow(0 0 10px var(--primary-color));
        cursor: pointer;
        transition-duration: .2s;
      }
    }

    .menuBtn {
      justify-self: start;
      margin-left: 10px;
    }
  }
  .left-menu{
    overflow-y: auto;
    grid-area: menu;
    background-color: var(--theme-color);
    width: 300px;
    height: 100%;
    animation: openMenu .4s forwards normal;
    position: absolute;
    transition-duration: .4s;
    border-radius: 4px;
    box-shadow: inset 0 0 0 0.5px var(--primary-color);
    padding: 3px;
    overflow: hidden;
    z-index: 3;

    .finder {
      width: calc(100% - 10px);
      height: 70px;
      margin: 5px;
      display: flex;
      justify-items: center;
      align-items: center;
      position: absolute;
      z-index: 2;

      input {
        width: 100%;
      }
    }
    .connections-list {
      height: 100%;
    }
  }

  .closed-menu {
    left: -10000px;
    animation: closeMenu .4s forwards normal !important;
  }

  .control-window {
    grid-area: control;
    background-color: var(--back-shadow);
    
    margin: 10px;
    border-radius: 10px;
    width: calc(100% - 20px);
    max-width: 100%;
    // max-height: calc(100% - 100px);
    box-shadow: 0 0 5px 2px var(--primary-color);

    display: flex;
    justify-items: center;
    align-items: center;

    position: relative;

    #capture {
      @extend %select-none;
      max-width: 100%;
      max-height: 100%;
      border-radius: 10px;
      object-fit: contain;
      position: absolute;
    }
  }
  .connection-window {
    z-index: 3;
  }
}

.main-wrapper__closed_menu {
  grid-template-areas: "nav nav" "control control";
}


@keyframes openMenu {
  0% {
    left: -10000px;
  }
  100% {
    left: 0;
  }
}

@keyframes closeMenu {
  0% {
    left: 0;
  }
  100% {
    left: -1000px;
  }
}

@media screen and (orientation:portrait) {
  .main-wrapper {
    .nav{
      grid-template-columns: 100px 50px 50px 50px 50px 1fr;
    }
  }
}


  .tooltip {
    padding: 4px;
    width: 300px;
    height: 50px;
    display: grid;
    justify-items: center;
    align-content: center;
    border-radius: 5px;
    background-color: var(--secondary-color);
    box-shadow: 0 0 4px 2px var(--secondary-shadow);
    color: var(--back-color);
    font-size: 18px;
    position: fixed;
    z-index: 3;
    @extend %select-none;

    animation-name: openToolTip;
    animation-duration: 1s;
    animation-direction: normal;
  }
  .close-tooltip {
    width: 0;
    height: 0;

    transition-duration: 0.4s;

    animation-name: closeToolTip;
    animation-duration: 1s;
    animation-direction: normal;

  }
  @keyframes openToolTip {
    0% {
      width: 0;
      height: 0;
      box-shadow: 0 0 7px 3px var(--primary-color);
      background-color: var(--primary-color);
    }
    75% {
      width: 300px;
      height: 0;
      box-shadow: 0 0 7px 3px var(--primary-color);
      background-color: var(--primary-color);
    }
    100% {
      width: 300px;
      height: 50px;
      box-shadow: 0 0 7px 3px var(--primary-color);
    }
  }
  @keyframes closeToolTip {
    0% {
      width: 300px;
      height: 50px;
      box-shadow: 0 0 7px 3px var(--primary-color);
    }
    25% {
      width: 300px;
      height: 0;
      box-shadow: 0 0 7px 3px var(--primary-color);
      background-color: var(--primary-color);
    }
    100% {
      width: 0;
      height: 0;
    }
  }

.show-scroll {
  display: block !important;
  opacity: 1 !important;
}
.scrollbar-track-x{
  height: 6px !important;
}
.scrollbar-thumb-x {
  height: 6px !important;
  border-radius: 2px !important;
}

.simple-keyboard, .keyboard {
  position: fixed;
  z-index: 3;
  // width: 98%;
  max-width: 96%;
  height: 280px;
  // bottom: 0;
  // left: calc(1%);
  background-color: var(--back-color);
  justify-self: center;
  align-self: end;
  bottom: 2px;
  box-shadow: 0 0 0 0.5px var(--primary-color);
}

</style>