<template>
  <div class="connections_history-list">
    <div class="empty" v-if="isEmptyElement"></div>
    <ConnectionItem v-for="connection in connections" :key="connection.name" :connection="connection"/>
    <!-- <div
      class="list-item"
      v-for="connection in connections"
      :key="connection.name"
    >
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
      <div class="connect-icon" :style="connection.status ? 'filter: drop-shadow(0 0 7px var(--primary-color)) hue-rotate(150deg)' : 'filter: drop-shadow(0 0 7px var(--primary-color))'">
        <img src="@/assets/remote-access.svg" alt="" />
      </div>
      <div class="close">
        <img src="@/assets/cancel.svg" alt="">
      </div>
      <div class="edit">
        <img src="@/assets/edit.svg" alt="">
      </div>
    </div> -->
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
import { defineComponent, PropType } from 'vue';
import * as bar from '@/smooth-scrollbar';
import ConnectionItem from '@/components/ConnectionsList/ConnectionItem.vue';

export default defineComponent({
  components: {
    ConnectionItem
  },
  props: {
    isEmptyElement: {
      default: true,
    },
    EmptyElementHeight: {
      default: 100,
    },
    connections: {
      type: Array as PropType<Connection[]>,
      default: [],
    },
  },
  mounted() {
    this.$el.querySelector('.empty').style.minHeight = this.EmptyElementHeight + 'px';
    //@ts-ignore
    let container = this.$el as HTMLElement;
    let scrollbar = bar.init(container, {
      damping: 0.1,
      continuousScrolling: true,
      renderByPixels: true,
      alwaysShowTracks: false,
      thumbMinSize: 20,
    });
  },
});
</script>

<style lang="scss" scoped>
%select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}

.connections_history-list {
  position: relative;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  .empty{
    min-height: 100px;
    width: 100%;
  }
}
</style>