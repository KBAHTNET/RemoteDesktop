<template>
  <div class="error-window" v-show="show">
    <svg viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" ref="err_svg">
      <path
        d="M 10 0 L 0 0 L 40 40 L 50 40 L 10 0 M 50 0 L 40 0 L 25 15 L 30 20 L 50 0 M 20 20 L 0 40 L 10 40 L 25 25 M 30 20"
        stroke="red"
        fill="transparent"
      />
    </svg>
    <h2>{{ text }}</h2>
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: "",
      show: false,
    };
  },
  methods: {
    ShowWindow(text) {
      if (text) {
        if (text.includes("<pre>")) {
          this.text = text.split("<pre>")[1].split("</pre>")[0];
        } else if (text.includes("<body>")) {
          this.text = text.split("<body>")[1].split("</body>")[0];
        } else {
          this.text = text;
        }
      }
      this.show = true;
      const svg = this.$refs["err_svg"];
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
  color: red;
  grid-area: h2;
  justify-self: center;
  align-self: center;
  z-index: 1000;

  text-align: center;
}
.error-window {
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  top: 0;
  left: 0;
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

  align-self: center;
  justify-self: center;

  position: relative;
  top: 5vh;
  left: 14vw;
}

path {
  stroke-dasharray: 5000;
  stroke-dashoffset: -150;
  fill: transparent;
}

svg.animate path {
  animation: 2s ease forwards draw;
  opacity: 1;
}

@keyframes draw {
  0% {
    opacity: 1;
    stroke-dashoffset: -150;
    fill: transparent;
    transform: translateY(0);
  }

  35% {
    stroke-dashoffset: 0;
    fill: transparent;
  }

  60% {
    fill: red;
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    fill: red;
    stroke-dashoffset: 0;
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>