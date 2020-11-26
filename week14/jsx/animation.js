const TICK = Symbol("tick")
const TICK_HANDlER = Symbol("tick-handler")
const ANIMATIONS = Symbol("animations")
const START_TIME = Symbol("start-time")

/**
 * 时间线
 * start 启动
 * pause 暂停
 * resume 取消暂停
 * reset 重启
 */
export class TimeLine {
  constructor() {
    this[ANIMATIONS] = new Set() // 保存animation实例
    this[START_TIME] = new Map() // 保存animation被添加进this[ANIMATIONS]的时间

  }

  /**
   * startTime TimeLine启动时间
   * now 执行到某一帧的时间
   * t 某一个动画执行时间
   */
  start() {
    let startTime = Date.now();
    this[TICK] = () => {
      let now = Date.now()
      for (let animation of this[ANIMATIONS]) {
        let t;
        if (this[START_TIME].get(animation) < startTime) { // TimeLine启动前添加的
          t = now - startTime;
        } else {
          t = now - this[START_TIME].get(animation); // TimeLine启动后添加的，以添加进的时间为准          
        }
        if (animation.duration < t) {
          this[ANIMATIONS].delete(animation)
          t = animation.duration  // 防止范围超出
        }
        animation.receive(t)
      }
      this[TICK_HANDlER] = requestAnimationFrame(this[TICK]) // 保存动画
    }
    this[TICK]()
  }

  pause() {
    cancelAnimationFrame(this[TICK_HANDlER]) // 停止动画
  }

  resume() {
    this[TICK]()
  }

  reset() { }

  // 把Animation实例添加到this[ANIMATIONS]
  add(animation, startTime = Date.now()) {
    this[ANIMATIONS].add(animation)
    this[START_TIME].set(animation, startTime)
  }
}

/**
 * 属性动画
 * 起始值
 * 终止值
 * 
 */
export class Animation {
  constructor(object, property, startVal, endVal, duration, delay, timingFunction) {
    // 保存实例的属性
    this.object = object;
    this.property = property;
    this.startVal = startVal;
    this.endVal = endVal;
    this.duration = duration;
    this.timingFunction = timingFunction;
    this.delay = delay;
  }
  // 接受虚拟时间，改变object的属性
  receive(time) {
    // console.log(time)
    let range = this.endVal - this.startVal
    this.object[this.property] = this.startVal + range * time / this.duration
    console.log("属性变化", this.object[this.property])
  }
}
