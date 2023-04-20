<template>
  <div class="signup-wrapper">
    <div class="reg-form" ref="form">
      <div class="title">Регистрация</div>
      <div class="menu">
        <div class="icon">
          <img src="@/assets/favicon.svg" alt="">
        </div>
        <form class="userdata">
          <FlatInput class="userdata-input" label="Логин" @newValue="updateLogin" :value="login" @enterPressed="focusToPass"/>
          <FlatInput class="userdata-input" label="Пароль" :secret="true" @newValue="updatePass" :value="pass" @enterPressed="focusToPassAgain"/>
          <FlatInput class="userdata-input" :label="labelPass" :secret="true"  @newValue="checkPassEquals" :value="repeatPass" id="checkPass" @enterPressed="reg"/>
        </form>
        <div class="auth-btn">Зарегистрироваться</div>
      </div>
      <div class="goto-signin" ref="goto-signin" @mouseenter="hoverIcon" @mouseleave="disHoverIcon" @click="changePage">
        <img src="@/assets/back.svg" alt="">
      </div>
    </div>
    <div class="tooltip" v-show="showTooltip" ref="tooltip">
      Перейти к авторизации
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { MutationTypes } from "@/store/mutation-types";
import FlatInput from "@/components/FlatInput.vue";
import { ActionTypes } from "@/store/action-types";

const file =  require('@/assets/pda.mp3');

export default defineComponent({
  components: {
    FlatInput,
  },
  data: () => {
    return {
      showTooltip: false,
      shouldToolTipShow: false,
      initToolTip: false,
      isToolTipClosing: false,

      nextPageTimer: 0,

      login: '',
      pass: '',
      repeatPass:'',
      labelPass: 'Повторите пароль',
    }
  },
  methods: {
    reg() {
      this.$store.dispatch(ActionTypes.registration, {login:this.login, pass:this.pass});
    },
    focusToPassAgain() {
      //@ts-ignore
      const passInput = document.querySelectorAll('input')[2] as HTMLInputElement;
      console.log('focus');
      
      passInput.focus();
    },
    focusToPass() {
      //@ts-ignore
      const passInput = document.querySelectorAll('input')[1] as HTMLInputElement;
      console.log('focus');
      
      passInput.focus();
    },
    updateLogin(newVal:string) {
      this.login = newVal;
      this.$store.commit(MutationTypes.UpdateLogin, newVal);
    },
    updatePass(newVal:string) {
      this.pass = newVal;
      this.$store.commit(MutationTypes.UpdatePass, newVal);
    },
    checkPassEquals(newVal:string) {
      //@ts-ignore
      const label = this.$el.querySelector('#checkPass').querySelector('span') as HTMLSpanElement;

      this.repeatPass = newVal;
      if(this.repeatPass === this.pass) {
        this.labelPass = 'Пароли совпадают';
        label.style.color = 'var(--success-color)';
      } else {
         this.labelPass = 'Пароли не совпадают';
         label.style.color = 'var(--error-color)';
      }
    },
    changePage() {
      this.showTooltip = false;
      //@ts-ignore
      const form = this.$refs['form'] as HTMLDivElement;

      form.classList.add('close');

      // //@ts-ignore
      // const audio = document.querySelector('#back-audio') as HTMLAudioElement;
      // if(audio.played) {
      //   audio.currentTime = 0;
      // } else {
      //   audio.play();
      // }

      // //@ts-ignore
      // document.querySelector('#back-audio').currentTime = 0;
      // //@ts-ignore
      // document.querySelector('#back-audio').play();


      this.nextPageTimer = setTimeout(() => {
        this.$router.push('/signin');
      }, 500);
    },
    hoverIcon(e:MouseEvent) {
      const el = e.target as HTMLDivElement;
      //@ts-ignore
      el.querySelector('img').style.filter = 'brightness(0)';
    },
    disHoverIcon(e:MouseEvent) {
      const el = e.target as HTMLDivElement;
      //@ts-ignore
      el.querySelector('img').style.filter = 'brightness(1)';
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
              tooltip.style.top = (e.clientY - 100) + 'px';
              
              if(parseInt(getComputedStyle(tooltip).left) + parseInt(getComputedStyle(tooltip).width) > window.innerWidth) {
                tooltip.style.left = '';
                tooltip.style.right = '3px';
              }
            }
            
            this.showTooltip = true;
          }
          this.initToolTip = true;
          setTimeout(() => {
            tooltip.innerText = 'Перейти к авторизации';
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
        if(id != this.nextPageTimer) {
          window.clearTimeout(id);
        }
        id--;
      }

      id = window.setInterval(() => {}, 0);
      console.log(id);
      while (id) {
        if(id != this.nextPageTimer) {
          window.clearInterval(id);
        }
        id--;
      }
    },
  },
  mounted() {
    //@ts-ignore
    document.querySelector('#back-audio').src = file;

    document.title = "SignUp To KVANT Remote Control";

    const gotoSignupEl = this.$refs['goto-signin'] as HTMLDivElement;
    gotoSignupEl.addEventListener('mouseenter', this.ShowToolTip);
    gotoSignupEl.addEventListener('mouseleave', this.HideToolTip);

    const titleEl = this.$el.querySelector('.title') as HTMLDivElement; 
    titleEl.innerText = 'Регистрация\nKVANT Remote Control';

    this.login = this.$store.state.userdata.login;
    this.pass = this.$store.state.userdata.pass;


    setTimeout(() => {
      //@ts-ignore
      document.querySelector('#back-audio').currentTime = 0;
      //@ts-ignore
      document.querySelector('#back-audio').play();
    }, 300);
    // setTimeout(() => {
    //   const audio = document.querySelector('#back-audio') as HTMLAudioElement;
    //   if(!audio.paused || audio.played) {
    //     audio.pause();
    //     audio.currentTime = 0;
    //   }
    // }, 500);
  },
  watch: {
    initToolTip(newVal) {
      if(!newVal && !this.shouldToolTipShow) {
        this.HideToolTip();
      }
    }
  },
});
</script>

<style lang="scss" scoped>

%select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}

.signup-wrapper{
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: 1fr 7fr 1fr;
  grid-template-areas: ". . ." ". auth ." ". . ." ;
  width: 100vw;
  height: 100vh;

  overflow: hidden;

  .close {
    animation: signupClose .4s forwards normal !important;
  }

  @keyframes signupClose {
    0% {
      left:calc(0%);
    }
    100% {
      left:3000px;
    }
  }

  .reg-form {
    grid-area: auth;
    background-color: var(--theme-color);
    border-radius: 10px;
    display: grid;
    grid-template-rows: 100px 1fr;
    grid-template-columns: 1fr;

    width: 500px;
    align-self: center;
    justify-self: center;
    position: relative;
    box-shadow: 0 0 20px 3px var(--back-shadow);
    animation: signupOpen .4s forwards normal;

    @keyframes signupOpen {
      0% {
        left: 3000px;
      }
      99% {
        left:calc(0%);
      }
      100% {
        left: none;
      }
    }

    .title {
      align-self: center;
      justify-self: center;
      color: var(--font-color);
      font-size: 24px;
      text-align: center;
      line-height: 40px;
      @extend %select-none;
    }

    .menu {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 200px 1fr 1fr;
      justify-content: stretch;
      align-content: stretch;
      justify-items: center;
      align-items: center;
      padding: 10px;

      .icon {
        align-self: stretch;
        justify-self: stretch;
        margin: 5px;
        position: relative;
        @extend %select-none;

        img {
          object-fit: contain;
          width: 100%;
          max-height: 100%;
        }
      }
      .userdata {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        margin-top: 10px;
        .userdata-input {
          margin: 3px;
        }
      }
      .auth-btn {
        background-color: var(--font-shadow);
        box-shadow: 0 0 10px 4px var(--back-color);
        align-self: center;
        justify-self: center;
        width: 90%;
        height: 80px;
        display: grid;
        align-content: center;
        justify-items: center;
        border-radius: 4px;
        font-size: 20px;
        transition-duration: .4s;
        @extend %select-none;

        &:hover {
          cursor: pointer;
          color: var(--font-color);
          background-color: var(--primary-color);
          box-shadow: 0 0 5px 2px var(--primary-shadow);
          transition-duration: .4s;
        }
      }
    }
    .goto-signin {
      height: 30px;
      width: 30px;
      display: grid;
      margin: 5px;
      border-radius: 100%;
      transition-duration: .4s;
      position: absolute;
      left: 5px;
      top: calc(55%);
      padding: 2px;
      @extend %select-none;
      &:hover {
        cursor: pointer;
        background-color: var(--primary-color);
        transition-duration: .4s;
        box-shadow: 0 0 10px 2px var(--back-shadow);
      }

      img{
        max-width: 100%;
        object-fit: contain;
        align-self: center;
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
    @extend %select-none;

    animation-name: openMenu;
    animation-duration: 1s;
    animation-direction: normal;
  }
  .close-tooltip {
    width: 0;
    height: 0;

    transition-duration: 0.4s;

    animation-name: closeMenu;
    animation-duration: 1s;
    animation-direction: normal;

  }
  @keyframes openMenu {
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
    @keyframes closeMenu {
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

  @media screen and (orientation: portrait) {
    &{
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
      grid-template-areas: "auth" ;
    }
    .reg-form {
      height: 95%;
      width: 95%;

      .goto-signin {
        top: 55%;
      }
    }
  }
}

</style>