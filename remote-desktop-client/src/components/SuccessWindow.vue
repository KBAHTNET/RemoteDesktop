<template>
  <div class="succes-window" v-show="show">
    <svg viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" ref="ok_svg">
      <path
        d="M 18 32.34 l -8.34 -8.34 -2.83 2.83 11.17 11.17 24 -24 -2.83 -2.83 z"
        stroke="#3da35a"
        fill="transparent"
      />
    </svg>
    <h2>{{ text }}</h2>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      typeof: String,
      default: "Успешно!",
    },
  },
  data() {
    return {
      show: false,
    };
  },
  methods: {
    ShowWindow() {
      this.show = true;
      const svg = this.$refs["ok_svg"];
      svg.classList.add("animate");
      setTimeout(() => {
        svg.classList.remove("animate");
        this.show = false;
      }, 2000);
    },
  },
};
</script>

<style scoped>
h2 {
  color: green;
  grid-area: h2;
  justify-self: center;
  align-self: center;
  z-index: 1000;

  text-align: center;
}
.succes-window {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.849);
  display: grid;

  grid-template-areas: ". . ." ". svg ." "h2 h2 h2";
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr;

  justify-items: center;
  align-items: center;
  justify-content: stretch;
  align-content: stretch;
}
svg {
  width: 100%;
  height: 100%;
  grid-area: svg;
  z-index: 1000;

  position: relative;
  top: 5vh;
  left: 14vw;
}

path {
  stroke-dasharray: 99.47578430175781;
  stroke-dashoffset: -99.47578430175781;
  fill: transparent;
}

svg.animate path {
  animation: 1.7s ease forwards draw;
  opacity: 1;
}

@keyframes draw {
  0% {
    opacity: 1;
    stroke-dashoffset: -99.47578430175781;
    fill: transparent;
    transform: translateY(0);
  }

  35% {
    stroke-dashoffset: 0;
    fill: transparent;
  }

  60% {
    fill: #3da35a;
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    fill: #3da35a;
    stroke-dashoffset: 0;
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>