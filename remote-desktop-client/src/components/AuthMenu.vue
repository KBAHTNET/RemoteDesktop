<template>
  <div class="menu">
    <form class="auth-form" @submit.prevent>
      <FlatInput
        class="menu-element username"
       
        label="Логин"
        @update:value="updateUserName"
      />
      <FlatInput
        class="menu-element pass"
        
        :secret="true"
        label="Пароль"
        @update:value="updatePass"
      />
    </form>
    <div class="menu-button menu-element" @click="auth">
      Войти
    </div>
    <div v-show="isMenuOpen" @click="close" class="close-button">
      <img src="@/assets/cancel.svg" alt="" />
    </div>
  </div>
</template>

<script>
import FlatInput from "@/components/FlatInput.vue";
export default {
  props: {
    animationTime: {
      type: Number,
      default: 1,
    },
    size: {
      type: Object,
      default: {
        width: 200,
        height: 200,
      },
    },
  },
  data: () => {
    return {
      isMenuOpen: false,
      openMenuClass: "open-menu",
      closeMenuClass: "close-menu",
      elementClass: "menu-element",

      currentWindowSize: {},
      previousWindowSize: {},
    };
  },
  methods: {
    updateUserName(newVal) {
      this.$emit("updateUserName", newVal);
    },
    updatePass(newVal) {
      this.$emit("updatePass", newVal);
    },
    auth() {
      this.$emit("auth");
    },
    toggleMenu(position) {
      if (this.isMenuOpen) {
        this.close();
      } else {
        if (!position) {
          this.open();
        } else {
          if (window.innerHeight < position.y + this.size.height) {
            this.$el.style.top = position.y - this.size.height - 20 + "px";
          } else {
            this.$el.style.top = position.y + 20 + "px";
          }

          if (window.innerWidth < position.x + this.size.width) {
            this.$el.style.left = position.x - this.size.width + "px";
          } else {
            this.$el.style.left = position.x + "px";
          }

          this.open();

          setTimeout(() => {
            this.$el.querySelector(".close-button").style.top =
              getComputedStyle(this.$el).top;
            this.$el.querySelector(".close-button").style.left =
              parseInt(getComputedStyle(this.$el).left) -
              20 +
              this.size.width +
              "px";
          }, this.animationTime * 1000);

          /*10 +
            "px";*/
        }
      }
    },
    open() {
      this.$el.classList.remove(this.closeMenuClass);
      this.$el.classList.add(this.openMenuClass);
      const menuElemes = this.$el.querySelectorAll(`.${this.elementClass}`);
      setTimeout(() => {
        Array.from(menuElemes).forEach((it, i) => {
          menuElemes[i].style.display = "grid";
          this.$el.style.padding = "3px";
        });
        this.isMenuOpen = true;
      }, this.animationTime * 1000);
      window.addEventListener("resize", this.checkPosition);
    },
    close() {
      const menuElemes = this.$el.querySelectorAll(`.${this.elementClass}`);
      Array.from(menuElemes).forEach((it, i) => {
        this.$el.style.padding = "";
        menuElemes[i].style.display = "none";
      });
      this.$el.classList.remove(this.openMenuClass);
      this.$el.classList.add(this.closeMenuClass);

      this.isMenuOpen = false;
      window.removeEventListener("resize", this.checkPosition);
    },
    checkPosition(e) {
      this.previousWindowSize = this.currentWindowSize;
      this.currentWindowSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      const delta = {
        width: this.currentWindowSize.width - this.previousWindowSize.width,
        height: this.currentWindowSize.height - this.previousWindowSize.height,
      };
      const currentPosition = {
        x: parseInt(this.$el.style.left),
        y: parseInt(this.$el.style.top),
      };
      this.$el.style.left = currentPosition.x + delta.width + "px";
      this.$el.style.top = currentPosition.y + delta.height + "px";

      setTimeout(() => {
        this.$el.querySelector(".close-button").style.top = getComputedStyle(
          this.$el
        ).top;
        this.$el.querySelector(".close-button").style.left =
          parseInt(getComputedStyle(this.$el).left) -
          20 +
          this.size.width +
          "px";
      }, this.animationTime * 1000);
    },
  },
  mounted() {
    this.$el.style.animationDuration = this.animationTime + "s";
    window.addEventListener("resize", this.checkPosition);
    this.currentWindowSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },
  unmounted() {
    window.removeEventListener("resize", this.checkPosition);
  },
  deactivated() {
    window.removeEventListener("resize", this.checkPosition);
  },
  components: {
    FlatInput,
  },
};
</script>

<style scoped>
.auth-form {
  margin-top: 20px;
}
.username {
  margin-bottom: 5px;
}
.menu {
  background-color: var(--font-color);
  display: grid;
  border-radius: 4px;
  background-color: var(--theme-color);

  overflow-y: auto;

  position: fixed;
  z-index: 2;
}

.close-button {
  position: fixed;
  height: 20px;
  width: 20px;
  background-color: var(--theme-color);
  color: var(--font-color);
  z-index: 2;
  transition-duration: 0.4s;
  text-align: center;
  border-radius: 4px;
  padding: 2px;

  cursor: pointer;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}
.close-button:hover {
  box-shadow: 0 0 5px 3px var(--primary-color);
  transition-duration: 0.4s;
}

.close-button img {
  max-width: 100%;
  object-fit: contain;
}

.menu-button {
  color: var(--font-color);
  border-style: solid;
  border-color: var(--primary-color);
  border-width: 1px;
  margin-top: 2px;
  transition-duration: 0.4s;
  vertical-align: middle;
  justify-content: center;
  text-align: center;
  align-content: center;

  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;

  word-break: break-word;
  /* overflow-y: auto; */
}

.menu-button:hover {
  transition-duration: 0.4s;
  box-shadow: 0 0 3px 2px var(--secondary-color);
  background-color: var(--primary-color);
  cursor: pointer;
}

.open-menu {
  width: 200px;
  height: 200px;
  box-shadow: 0 0 10px 5px var(--primary-color);

  transition-duration: 0.4s;

  animation-name: openMenu;
  animation-duration: 1s;
  animation-direction: normal;
}

.close-menu {
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
    width: 200px;
    height: 0;
    box-shadow: 0 0 7px 3px var(--primary-color);
    background-color: var(--primary-color);
  }
  100% {
    width: 200px;
    height: 200px;
    box-shadow: 0 0 7px 3px var(--primary-color);
  }
}

@keyframes closeMenu {
  0% {
    width: 200px;
    height: 200px;
    box-shadow: 0 0 7px 3px var(--primary-color);
  }
  25% {
    width: 200px;
    height: 0;
    box-shadow: 0 0 7px 3px var(--primary-color);
    background-color: var(--primary-color);
  }
  100% {
    width: 0;
    height: 0;
  }
}
</style>