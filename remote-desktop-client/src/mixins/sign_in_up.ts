import { defineComponent } from "vue";

export default defineComponent({
  data: () => {
    return {
      showTooltip: false,
      shouldToolTipShow: false,
      initToolTip: false,
    }
  },
  methods: {
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
      const tooltip = this.$refs['tooltip'] as HTMLDivElement;
       this.shouldToolTipShow = true;
      if(!this.initToolTip) {
        if(!this.showTooltip) {
          tooltip.innerText = '';

          tooltip.style.left = (e.clientX - 300) + 'px';
          tooltip.style.top = (e.clientY - 100) + 'px';
          
          if(parseInt(getComputedStyle(tooltip).left) + parseInt(getComputedStyle(tooltip).width) > window.innerWidth) {
            tooltip.style.left = '';
            tooltip.style.right = '3px';
          }
          // if(parseInt(getComputedStyle(tooltip).left) - parseInt(getComputedStyle(tooltip).width) < 0) {
          //   tooltip.style.left = '3px';
          //   tooltip.style.right = '';
          // }
        }
        
        this.showTooltip = true;
      }
      this.initToolTip = true;
      setTimeout(() => {
        tooltip.innerText = 'Перейти к регистрации';
        this.initToolTip = false;
      }, 900);
      
    },
    HideToolTip() {
      const tooltip = this.$refs['tooltip'] as HTMLDivElement;
      this.shouldToolTipShow = false;
      if(!this.initToolTip) {
        setTimeout(() => {
          tooltip.innerText = '';
        }, 100);

        tooltip.classList.add('close-tooltip');
        setTimeout(() => {
          this.showTooltip = false;
          tooltip.classList.remove('close-tooltip');
        }, 900);
      }
    },
  },
  mounted() {
    const gotoSignupEl = this.$refs['goto-signup'] as HTMLDivElement;
    gotoSignupEl.addEventListener('mouseenter', this.ShowToolTip);
    gotoSignupEl.addEventListener('mouseleave', this.HideToolTip);

    const titleEl = this.$el.querySelector('.title') as HTMLDivElement; 
    titleEl.innerText = 'Авторизация\nKVANT Remote Control';
  },
  watch: {
    initToolTip(newVal) {
      if(!newVal && !this.shouldToolTipShow) {
        this.HideToolTip();
      }
    }
  }
});