<template>
  <div class="col">
    <div class="con">
      <div class="bar arrow-top-r"></div>
      <div class="bar arrow-middle-r"></div>
      <div class="bar arrow-bottom-r"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    size: {
      default: {
        width: 30,
        height: 1,
      }
    },
    isActivate: {
      default: false,
      required: true,
    },
  },
  mounted() {
    const bars = this.$el.querySelectorAll('.bar') as HTMLDivElement[];
    Array.from(bars).forEach((it) => {
      it.style.width = this.size.width + 'px';
      it.style.height = this.size.height + 'px';
    });

    if(this.isActivate) {
      this.$el.querySelector('.con').classList.add('menu-activate');
    }
  },
  watch: {
    isActivate(newVal) {
      if(newVal) {
        this.$el.querySelector('.con').classList.add('menu-activate');
      } else {
        this.$el.querySelector('.con').classList.remove('menu-activate');
      }
    }
  }
});
</script>

<style scoped lang="scss">
%select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}
.menu-activate {
  .arrow-top-r {
    -webkit-transform: rotateZ(-45deg) translateY(9px);
    -moz-transform: rotateZ(-45deg) translateY(9px);
    -ms-transform: rotateZ(-45deg) translateY(9px);
    -o-transform: rotateZ(-45deg) translateY(9px);
    transform: rotateZ(-45deg) translateY(9px);
    width: 50% !important;
  }
  .arrow-middle-r {
   -webkit-transform: translateX(55%);
   -moz-transform: translateX(55%);
   -ms-transform: translateX(55%);
   -o-transform: translateX(55%);
   transform: translateX(55%);
 }
  .arrow-bottom-r {
    -webkit-transform: rotateZ(45deg) translateY(-9px);
    -moz-transform: rotateZ(45deg) translateY(-9px);
    -ms-transform: rotateZ(45deg) translateY(-9px);
    -o-transform: rotateZ(45deg) translateY(-9px);
    transform: rotateZ(45deg) translateY(-9px);
    width: 50% !important;
  }
  .bar {
    background-color: var(--primary-color);
    filter: drop-shadow(0 0 10px var(--primary-color));
  }
}

 .con {
   cursor: pointer;
   display: inline-block;
 }
 
 .bar {
   display: block;
   background: var(--font-color);
   margin: 10px auto;
 }
 
 .con {
   width: auto;
   margin: 0 auto;
   -webkit-transition: all .4s ease;
   -moz-transition: all .4s ease;
   -ms-transition: all .4s ease;
   -o-transition: all .4s ease;
   transition: all .4s ease;
 }
 
 .col {
   display: inline-block;
   width: 24%;
   text-align: center;
   height: auto;
   position: relative;
 }
 

 .bar {
   -webkit-transition: all .4s ease;
   -moz-transition: all .4s ease;
   -ms-transition: all .4s ease;
   -o-transition: all .4s ease;
   transition: all .4s ease;
 }
</style>