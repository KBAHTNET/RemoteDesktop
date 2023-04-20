<template>
  <div class="connections_history-item">
    <div class="image-container">
      <img
        src="@/assets/windows.svg"
        v-if="connection.os === 'windows'"
        alt=""
      />
      <img
        src="@/assets/linux-logo.svg"
        v-if="connection.os === 'linux'"
        alt=""
      />
    </div>
    <div class="computer-name">
      {{ connection.name }}
    </div>
    <div class="connection-method">
      {{ connection.conMethdod }}
    </div>
    <div class="settings" v-if="connection.conMethdod === 'image sourcing'">
      <div class="fps">
        {{ connection.fps }}
        <div class="fps-icon">
          <img src="@/assets/fps.svg" alt="" />
        </div>
      </div>
      <div class="quality">
        {{ connection.quality }}
        <div class="quality-icon">
          <img src="@/assets/picture.svg" alt="" />
        </div>
      </div>
    </div>
    <div class="connect-icon" :style="status ? 'filter: drop-shadow(0 0 7px var(--primary-color)) hue-rotate(150deg)' : 'filter: drop-shadow(0 0 7px var(--primary-color))'">
      <img src="@/assets/remote-access.svg" alt="" />
    </div>
    <div class="close">
      <img src="@/assets/cancel.svg" alt="">
    </div>
    <div class="edit">
      <img src="@/assets/edit.svg" alt="">
    </div>
  </div>
</template>

<script lang="ts">
interface Connection {
  name: string;
  conMethdod: "streaming" | "image sourcing";
  os: "windows" | "linux";
  fps?: number;
  quality?: number;
}
import { appConfigs } from '@/app.constants';
import { ActionTypes } from '@/store/action-types';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    connection: {
      type: Object as PropType<Connection>,
      default: {},
    },
  },
  data: () => {
    return {
      status: false as boolean, 
      checkCompAccessInterval: undefined as number|undefined   
    }
  },
  mounted() {
    this.checkCompAccessInterval = setInterval(() => {
      this.$store.dispatch(ActionTypes.checkCompForAccess, this.connection.name).then(res => {
        res ? this.status = true : this.status = false;
      });
    }, appConfigs.checkServerTime);
  },
  unmounted() {
    clearInterval(this.checkCompAccessInterval);
  }
});
</script>

<style lang="scss" scoped>
%select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}

.connections_history-item {
  display: grid;
  grid-template-rows: 100px 50px;
  grid-template-columns: 90px 1fr 50px 1fr;
  padding: 5px;
  background-color: var(--back-color);
  margin: 10px 5px;
  border-radius: 5px;
  position: relative;

  justify-items: center;
  align-items: center;
  justify-content: stretch;
  align-content: stretch;

  grid-template-areas: "os compName compName compName" "os conMethod settings conIcon";

  .image-container {
    grid-area: os;
    filter: hue-rotate(180deg);
    padding: 4px;
    @extend %select-none;

    img {
      width: 100%;
      object-fit: contain;
    }
  }

  .computer-name {
    grid-area: compName;
    color: var(--font-color);
    align-self: center;
    justify-self: center;
    font-size: 26px;
    max-width: calc(100% - 6px);
    overflow-x: auto;
    margin: 0px 3px;
    word-break: break-word;
  }

  .connection-method {
    grid-area: conMethod;
    color: var(--font-color);
    align-self: center;
    justify-self: center;
    font-size: 16px;
    text-align: center;
    @extend %select-none;
  }

  .settings {
    grid-area: settings;
    color: var(--font-color);
    justify-self: end;
    @extend %select-none;

    .fps {
      position: relative;

      .fps-icon {
        width: 20px;
        height: 20px;
        top: 0;
        left: -125%;
        position: absolute;
        width: 100%;

        img {
          width: 100%;
          object-fit: contain;
        }
      }
    }

    .quality {
      position: relative;

      .quality-icon {
        width: 20px;
        height: 20px;
        top: 0;
        left: -125%;
        position: absolute;

        img {
          width: 100%;
          object-fit: contain;
        }
      }
    }
  }

  .connect-icon {
    grid-area: conIcon;
    padding: 6px;
    width: 40px;
    height: 40px;
    @extend %select-none;

    &:hover {
      cursor: pointer;
      filter: drop-shadow(0 0 7px var(--primary-color));
    }

    img {
      width: 100%;
      object-fit: contain;
    }
  }

  .close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 15px;
    height: 15px;

    &:hover {
      cursor: pointer;
      filter: drop-shadow(0 0 5px var(--primary-color));
    }

    img {
      width: 100%;
      object-fit: contain;
    }
  }

  .edit {
    position: absolute;
    bottom: 10px;
    left: 10px;
    width: 15px;
    height: 15px;

    &:hover {
      cursor: pointer;
      filter: drop-shadow(0 0 5px var(--primary-color));
    }

    img {
      width: 100%;
      object-fit: contain;
    }
  } 
}
</style>