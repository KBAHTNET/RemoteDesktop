<template>
  <div class="keyboardContainer">
    <div class="simple-keyboard-main"></div>

    <div class="shiftleft_pressed_indicator indicator" v-show="isLeftShiftPressed" ref="left_shift_indicator"></div>
    <div class="caps_pressed_indicator indicator" v-show="isCapsPressed" ref="caps_indicator"></div>
    <div class="ctrlleft_pressed_indicator indicator" v-show="isCtrlLeftPressed" ref="left_ctrl_indicator"></div>
    <div class="altleft_pressed_indicator indicator" v-show="isAltLeftPressed" ref="altleft_indicator"></div>
    <div class="left_win_pressed_indicator indicator" v-show="isLeftWinPressed" ref="left_win_indicator"></div>

  </div>
</template>

<script>
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
export default {
  props: {
    input: String
  },
  data: () => ({
    keyboard: null,
    keyboardControlPad: null,
    keyboardArrows: null,
    keyboardNumPad: null,
    keyboardNumPadEnd: null,

    isLeftShiftPressed: false,
    isCapsPressed: false,
    isCtrlLeftPressed: false,
    isAltLeftPressed: false,
    isLeftWinPressed: false,

  }),
  mounted() {
    let commonKeyboardOptions = {
      onChange: input => this.onChange(input),
      onKeyPress: button => this.onKeyPress(button),
      theme: "simple-keyboard hg-theme-default hg-layout-default",
      physicalKeyboardHighlight: true,
      syncInstanceInputs: true,
      mergeDisplay: true,
      debug: true
    };
    this.keyboard = new Keyboard(".simple-keyboard-main", {
      ...commonKeyboardOptions,
      /**
       * Layout by:
       * Sterling Butters (https://github.com/SterlingButters)
       */
      layout: {
        default: [
          "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
          "` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
          "{tab} q w e r t y u i o p [ ] \\",
          "{capslock} a s d f g h j k l ; ' {enter}",
          "{shiftleft} z x c v b n m , . /",
          "{controlleft} {metaleft} {altleft} {space}"
        ],
        shift: [
          "{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}",
          "~ ! @ # $ % ^ & * ( ) _ + {backspace}",
          "{tab} Q W E R T Y U I O P { } |",
          '{capslock} A S D F G H J K L : " {enter}',
          "{shiftleft} Z X C V B N M < > ?",
          "{controlleft} {metaleft} {altleft} {space}"
        ]
      },
      display: {
        "{escape}": "esc ⎋",
        "{tab}": "tab⇥",
        "{backspace}": "back ⌫",
        "{enter}": "enter ↵",
        "{capslock}": "caps lock ⇪",
        "{shiftleft}": "shift ⇧",
        "{controlleft}": "ctrl ⌃",
        "{altleft}": "alt ⌥",
        "{metaleft}": "cmd ⌘",
        "{space}": "                                                      ",
      }
    });
  },
  unmounted() {
    this.$el.innerHTML = '';
  },
  methods: {
    onChange(input) {
      this.$emit("onChange", input);
    },
    onKeyPress(button) {
      this.$emit("onKeyPress", button);
      if(button === "{shiftleft}") {
        //@ts-ignore
        let a = this.keyboard.getButtonElement('{shiftleft}').getBoundingClientRect();
        this.isLeftShiftPressed = !this.isLeftShiftPressed;
        this.$refs['left_shift_indicator'].style.top = a.top + 'px';
        this.$refs['left_shift_indicator'].style.left = a.left + 'px';
      }
      if(button === "{capslock}") {
        //@ts-ignore
        let a = this.keyboard.getButtonElement('{capslock}').getBoundingClientRect();
        this.isCapsPressed = !this.isCapsPressed;
        this.$refs['caps_indicator'].style.top = a.top + 'px';
        this.$refs['caps_indicator'].style.left = a.left + 'px';
      }
      if(button === "{controlleft}") {
        //@ts-ignore
        let a = this.keyboard.getButtonElement('{controlleft}').getBoundingClientRect();
        this.isCtrlLeftPressed = !this.isCtrlLeftPressed;
        this.$refs['left_ctrl_indicator'].style.top = a.top + 'px';
        this.$refs['left_ctrl_indicator'].style.left = a.left + 'px';
      }
      if(button === "{altleft}") {
        //@ts-ignore
        let a = this.keyboard.getButtonElement('{altleft}').getBoundingClientRect();
        this.isAltLeftPressed = !this.isAltLeftPressed;
        this.$refs['altleft_indicator'].style.top = a.top + 'px';
        this.$refs['altleft_indicator'].style.left = a.left + 'px';
      }
      if(button === "{metaleft}") {
        //@ts-ignore
        let a = this.keyboard.getButtonElement('{metaleft}').getBoundingClientRect();
        this.isLeftWinPressed = !this.isLeftWinPressed;
        this.$refs['left_win_indicator'].style.top = a.top + 'px';
        this.$refs['left_win_indicator'].style.left = a.left + 'px';
      }
      /**
       * If you want to handle the shift and caps lock buttons
       */
      if (
        button === "{shift}" ||
        button === "{shiftleft}" ||
        button === "{shiftright}" ||
        button === "{capslock}"
      )
        this.handleShift();
    },
    handleShift() {
      let currentLayout = this.keyboard.options.layoutName;
      let shiftToggle = currentLayout === "default" ? "shift" : "default";
      this.keyboard.setOptions({
        layoutName: shiftToggle
      });
    }
  },
  watch: {
    input(input) {
      this.keyboard.setInput(input);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.indicator {
  width: 10px;
  height: 10px;
  background-color: rgb(44, 255, 44);
  position: fixed;
  border-radius: 100%;
  filter: drop-shadow(0 0 10px rgb(44, 255, 44));
}
.keyboardContainer {
  display: flex;
  background-color: rgba(0, 0, 0, 0.1);
  justify-content: center;
  /* width: 1024px; */
  margin: 0 auto;
  border-radius: 5px;
}

.simple-keyboard.hg-theme-default {
  display: inline-block;
}

.simple-keyboard-main.simple-keyboard {
  /* width: 640px; */
  /* min-width: 640px; */
  background-color: transparent;
}

.simple-keyboard-main.simple-keyboard .hg-row:first-child {
  margin-bottom: 10px;
}

.simple-keyboard-arrows.simple-keyboard {
  align-self: flex-end;
  background-color: transparent;
}

.simple-keyboard .hg-button.selectedButton {
  background-color: rgba(5, 25, 70, 0.53);
  color: white;
}

.simple-keyboard .hg-button.emptySpace {
  pointer-events: none;
  background-color: transparent;
  border: none;
  box-shadow: none;
}

.simple-keyboard-arrows .hg-row {
  justify-content: center;
}

.simple-keyboard-arrows .hg-button {
  width: 50px;
  flex-grow: 0;
  justify-content: center;
  display: flex;
  align-items: center;
}

.controlArrows {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-flow: column;
}

.simple-keyboard-control.simple-keyboard {
  background-color: transparent;
}

.simple-keyboard-control.simple-keyboard .hg-row:first-child {
  margin-bottom: 10px;
}

.simple-keyboard-control .hg-button {
  width: 50px;
  flex-grow: 0;
  justify-content: center;
  display: flex;
  align-items: center;
}

.numPad {
  display: flex;
  align-items: flex-end;
}

.simple-keyboard-numpad.simple-keyboard {
  background-color: transparent;
}

.simple-keyboard-numpad.simple-keyboard {
  width: 160px;
}

.simple-keyboard-numpad.simple-keyboard .hg-button {
  width: 50px;
  justify-content: center;
  display: flex;
  align-items: center;
}

.simple-keyboard-numpadEnd.simple-keyboard {
  width: 50px;
  background: transparent;
  margin: 0;
  padding: 5px 5px 5px 0;
}

.simple-keyboard-numpadEnd.simple-keyboard .hg-button {
  align-items: center;
  justify-content: center;
  display: flex;
}

.simple-keyboard-numpadEnd .hg-button.hg-standardBtn.hg-button-plus {
  height: 85px;
}

.simple-keyboard-numpadEnd.simple-keyboard .hg-button.hg-button-enter {
  height: 85px;
}

.simple-keyboard.hg-theme-default .hg-button.hg-selectedButton {
  background: rgba(5, 25, 70, 0.53);
  color: white;
}

.hg-button.hg-functionBtn.hg-button-space {
  /* width: 350px; */
}
</style>
