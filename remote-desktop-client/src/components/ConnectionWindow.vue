<template>
  <div class="connection-window">
    <img class="icon" src="@/assets/remote-access.svg" alt="">
    <FlatInput label="Имя компьютера" :value="name" @newValue="updateName"/>
    <FlatInput label="Пароль" :value="pass" @newValue="updatePass" :secret="true"/>
    <div class="select">
      <select name="" id="" @change="changeSelectValue">
        <optgroup label="Способ передачи изображения">
          <option value="0">Image Sourcing</option>
          <option value="1">Стриминг</option>
        </optgroup>
      </select>
      <div class="select-info">
        <img src="@/assets/question.svg" alt="">
      </div>
    </div>
    <div class="more">

    <details v-if="selectValue === 0">
      <summary @click.stop="toggleDetails">
        Больше настроек
      </summary>
      <div class="settings1" v-if="selectValue === 0">
        <FlatInput label="FPS" :value="fps.toString()" @newValue="updateFPS"/>
        <FlatInput label="Качество" :value="quality.toString()" @newValue="updateQulity"/>
      </div>
      <!-- <div class="settings2" v-if="$el.querySelector('select').value === 1">

      </div> -->
    </details>
    </div>
    <div class="connect-btn" @click="connect">Подключиться</div>
    <div class="close" @click="closeWindow">
      <img src="@/assets/cancel.svg" alt="">
    </div>
  </div>
</template>

<script lang="ts">
import { ActionTypes } from "@/store/action-types";
import { defineComponent } from "@vue/runtime-core";
import FlatInput from "./FlatInput.vue";
export default defineComponent({
  components: {
    FlatInput,
  },
  data: () => {
    return {
      isDetailsOpen: false as boolean,

      fps: 30 as number,
      quality: 10 as number,
      name: '' as string,
      pass: '' as string,
      selectValue: 0 as number,
    }
  },
  methods: {
    connect() {
      const conData = {
        name: this.name,
        pass: this.pass,
      } as import('@/store/state').Connection;
      if(this.selectValue === 0) {
        conData.conMethdod ='image sourcing',
        conData.fps = this.fps,
        conData.quality = this.quality
      } else {
        conData.conMethdod = 'streaming';
      }
      this.$emit('connect');
      this.$store.dispatch(ActionTypes.connectToComp, conData);
    },
    checkCompForAccess(compName:string) {
      this.$store.dispatch(ActionTypes.checkCompForAccess, compName).then(res => {
        //@ts-ignore
        const icon = this.$el.querySelector('.icon') as HTMLImageElement;
        if(res) {
          icon.style.filter = getComputedStyle(icon).filter + " hue-rotate(150deg)";
        } else {
          icon.style.filter = "";
        }
      });
    },
    updateName(newVal:string) {
      this.name = newVal;
      this.checkCompForAccess(this.name);
    },
    updatePass(newVal:string) {
      this.pass = newVal;
    },
    updateFPS(newVal:string) {
      if(newVal && (newVal === '0' || parseInt(newVal))) {
        this.fps = parseInt(newVal);
      } else if(newVal.length === 0) {
        this.fps = 0;
      } 
      else {
        this.fps = 30;
        this.$el.querySelectorAll('input')[2].value="30";
      }
      if(this.fps > 60) {
        this.fps = 60;
        this.$el.querySelectorAll('input')[2].value="60";
      }
      if(this.fps === 0) {
        this.$el.querySelectorAll('span')[4].innerText = "Недопутимое значение";
        this.$el.querySelectorAll('span')[4].style.color = 'var(--error-color)';
      } else {
        this.$el.querySelectorAll('span')[4].innerText = "FPS";
        this.$el.querySelectorAll('span')[4].style.color = 'var(--primary-color)';
      }
    },
    updateQulity(newVal:string) {
      if(newVal && parseInt(newVal)) {
        this.quality = parseInt(newVal);
      } else if(newVal.length === 0) {
        this.quality = 0;
      } 
      else {
        this.quality = 10;
        this.$el.querySelectorAll('input')[3].value="10";
      }
      if(this.quality > 100) {
        this.quality = 100;
        this.$el.querySelectorAll('input')[3].value="100";
      }

      if(this.quality === 0) {
        this.$el.querySelectorAll('span')[6].innerText = "Недопутимое значение";
        this.$el.querySelectorAll('span')[6].style.color = 'var(--error-color)';
      } else {
        this.$el.querySelectorAll('span')[6].innerText = "Качество";
        this.$el.querySelectorAll('span')[6].style.color = 'var(--primary-color)';
      }
    },
    changeSelectValue(e:Event) {
      const select = e.target as HTMLSelectElement;
      this.selectValue = parseInt(select.value);
      this.$el.style.gridTemplateRows = "140px 80px 80px 60px 50px 50px";
      this.isDetailsOpen = false;
    },
    toggleDetails() {
      this.isDetailsOpen = !this.isDetailsOpen;
      if(this.isDetailsOpen) {
        this.$el.style.gridTemplateRows = "140px 80px 80px 60px 250px 50px";
      } else {
        this.$el.style.gridTemplateRows = "140px 80px 80px 60px 50px 50px";
      }
    },
    closeWindow() {
      this.$emit('closeWindow');
    }
  }
});
</script>

<style lang="scss" scoped>
%select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}

.connection-window{
  position: fixed;
  display: grid;
  background-color: var(--theme-color);
  border-radius: 10px;
  grid-template-columns: 1fr;
  grid-template-rows: 140px 80px 80px 60px 50px 50px;
  left: calc(50% - 200px);
  top: calc(50% - 250px);
  width: 400px;
  height: 500px;
  box-shadow: 0 0 4px 2px var(--primary-color);
  padding: 10px;
  justify-items: stretch;
  align-items: stretch;
  overflow-y: auto;
  opacity: 0.9;

  animation-name: openWindow;
  animation-direction: normal;
  animation-fill-mode: both;
  animation-duration: 1s;

  .icon {
    justify-self: stretch;

    filter: drop-shadow(0 0 10px var(--primary-color));
    img {
      width: 100%;
      object-fit: contain;
      
    }
  }

  .select {
    display: grid;
    grid-template-columns: 1fr 40px;
    grid-template-rows: 1fr;
    justify-items: stretch;
    justify-content: center;
    align-content: center;
    align-items: stretch;

    img {
      padding: 5px;
      max-width: 100%;
      object-fit: contain;
      filter: brightness(0.3);

      &:hover {
        cursor: pointer;
        filter: brightness(1) drop-shadow(0 0 10px var(--primary-color));
      }
    }

    select {
      background-color: var(--back-color);
      color: var(--font-color);
      border-radius: 4px;
      max-height: 40px;
      border: none;

      &:hover {
        cursor: pointer;
        box-shadow: 0 0 4px 2px var(--primary-color);
      }

      &:focus {
        border: none;
      }
    }
  }
  .close {
    position: absolute;
    right: 10px;
    top: 10px;
    width: 30px;
    height: 30px;
    border-radius: 100%;
    padding: 3px;

    img {
      width: 100%;
      object-fit: contain;
      filter: brightness(1);

      &:hover {
        filter: brightness(10);
      }
    }

    &:hover {
      cursor: pointer;
      box-shadow: 0 0 4px 2px var(--primary-color);
      filter: brightness(10);
    }
  }

  .connect-btn {
    margin-top: 10px;
    display: grid;
    justify-content: center;
    align-items: center;
    color: var(--font-color);
    font-size: 20px;
    border-radius: 4px;
    background-color: var(--font-shadow);
    transition-duration: .4s;
    @extend %select-none;
    &:hover {
      box-shadow: 0 0 4px 2px var(--primary-shadow);
      cursor: pointer;
      background-color: var(--primary-color);
      transition-duration: .4s;
      color: var(--back-color);
    }
  }
}

summary {
  margin-top: 10px;
  text-align: center;
  color: var(--primary-shadow);
  font-size: 24px;
  transition-duration: .4s;

  @extend %select-none;

  &:hover {
    cursor: pointer;
  }

}

details[open] {
  summary {
    color: var(--primary-color);
    text-shadow: 0 0 10px var(--primary-color);
    transition-duration: .4s;
  }

  .settings1 {
    // animation: openDetails .4s forwards normal;
    animation-name: openDetails;
    animation-direction: normal;
    animation-fill-mode: both;
    animation-duration: .4s;
    border-radius: 5px;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    margin-top: 10px;
    background-color: var(--back-color);
    box-shadow: 0 0 4px 2px var(--primary-color);
    width: 100%;
    height: 150px;
  }
}

@keyframes openDetails {
  0% {
    height: 0;
  }
  100% {
    height: 200px;
  }
}

@keyframes openWindow {
  0% {
    transform: rotateY(181deg) scale(0.1);
    height: 1px;
    top: 50px;
  }

  100% {
    transform: rotateY(0deg) scale(1);
    height: 500px;
    top: calc(50% - 250px);
  }
}


// .settings1 {
//   margin-top: 10px;
//   display:grid;
//   background-color: var(--back-color);
//   box-shadow: 0 0 4px 2px var(--primary-color);
//   width: 100%;
//   height: 150px;
//   margin-bottom: 10px;
// }

@media screen and (orientation:portrait) {
  .connection-window {
    width: calc(100% - 20px);
    left: calc(50% - calc(100% - 20px) / 2);
  }
  
}
</style>