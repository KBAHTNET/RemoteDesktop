<template>
  <router-view/>
  <audio id="back-audio" src=""></audio>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { ActionTypes } from "./store/action-types";
export default defineComponent({
  mounted() {
    this.$store.dispatch(ActionTypes.checkCompForAccess).then(res => {console.log(res);});

    this.$store.dispatch(ActionTypes.initSocket);
  }
});
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* W3C standard
   сейчас только для Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #333 #ff0040;
}

/* для Chrome/Edge/Safari */
*::-webkit-scrollbar {
  height: 5px;
  width: 8px;
}
*::-webkit-scrollbar-track {
  background: #333;
  border-style: solid;
  border-color: #ff5599;
  border-width: 1px;
  border-radius: 5px;
  margin-right: 3px;
  margin-top: 1px;
  margin-bottom: 1px;
}
*::-webkit-scrollbar-thumb {
  background-color: #ff5599;
  border: 2px solid black;
  /* box-shadow: 0 0 30px 10px #ff5599; */
  border-radius: 4px;
}
*::-webkit-scrollbar-thumb:hover {
  background-color: rgb(0, 0, 0);
  border-radius: 2px;
  border: 1px solid #ff5599;
  /* box-shadow: 0 0 30px 30px #ff5599; */
}
::selection {
  background: #ff5599;
  color: black;
}
:root {
  --theme-color: #333333;
  --back-color: #222222;
  --back-shadow: #111111;
  --font-color: #ffffff;
  --font-shadow: #777777;
  --primary-color: #ff5599;
  --primary-shadow: #932451;
  --secondary-color: #ffd700;
  --secondary-shadow: #8f7a09;

  --success-color: #2ae62a;
  --error-color: #c72e43;
  --warning-color: #f37b36;
}

#app {
  max-width: 100vw;
  min-height: 100vh;
  background-color: var(--back-color);
  position: relative;
  overflow: hidden;

  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

.scrollbar-track-y{
  width: 6px !important;
  border-radius: 10px !important;
}
.scrollbar-thumb-y {
  width: 6px !important;
  border-radius: 2px !important;
}
</style>
