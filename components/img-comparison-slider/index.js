Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  data: {
    exposure: 50,
    transitionTime: 0,
    isTouchComparing: false,
    hasTouchMoved: false,
    clientRect: {}
  },
  lifetimes: {
    attached() {
      this.domEle = wx.createSelectorQuery().in(this).select('#img-comparison-container');
      this.getBoundingClientRect().then(rect => {
        this.clientRect = rect
      })
    }
  },
  methods: {
    onTouchStart(e) {
      this.touchStartPoint = this.getTouchPagePoint(e);

      this.enableTransition();
      this.slideToPageX(e.touches[0].pageX);
    },
    enableTransition() {
      const transitionTime = 100;

      this.setData({
        transitionTime
      });

      this.transitionTimer = setTimeout(() => {
        this.setData({
          transitionTime: 0
        })
        this.transitionTimer = null;
      }, transitionTime);
    },
    onTouchMove(e) {
      if (this.isTouchComparing) {
        this.slideToPageX(e.touches[0].pageX);
        return false;
      }

      if (!this.hasTouchMoved) {
        const currentPoint = this.getTouchPagePoint(e);
        if (
          Math.abs(currentPoint.y - this.touchStartPoint.y) <
          Math.abs(currentPoint.x - this.touchStartPoint.x)
        ) {
          this.isTouchComparing = true;
          this.slideToPageX(e.touches[0].pageX);
          return false;
        }

        this.hasTouchMoved = true;
      }
    },
    onTouchEnd() {
      this.isTouchComparing = false;
      this.hasTouchMoved = false;
    },
    slideToPageX(pageX) {
      const x = pageX - this.clientRect.left
      this.exposure = (x / this.clientRect.width) * 100;
      this.slide(0);
    },
    slide(increment = 0) {
      this.exposure = this.inBetween(this.exposure + increment, 0, 100);
      this.setData({
        exposure: 100 - this.exposure
      })
    },
    inBetween(actual, min, max) {
      if (actual < min) {
        return min;
      }
    
      if (actual > max) {
        return max;
      }
    
      return actual;
    },
    getTouchPagePoint(e) {
      return {
        x: e.touches[0].pageX,
        y: e.touches[0].pageY
      }
    },
    getBoundingClientRect() {
      return new Promise(resolve => {
        this.domEle.boundingClientRect(rect => {
          resolve(rect)
        }).exec();
      })
    }
  }
})