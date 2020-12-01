
/** listen <= recognize <= dispatch */

export class Listen {
  constructor(element, recognize) {  // 传入 new Recognize()
    /**
     * 鼠标点击事件 模板
    */
    let contexts = new Map(); // 保存每个touch的上下文信息

    // 判断是否已经绑定了mousemove和mouseup事件：在手指多次mousedown的时候，mousemove和mouseup会被多次绑定，每次鼠标抬起，会触发两次同一个按键的mouseup事件，导致报错
    let isListeningMouse = false;

    element.addEventListener("mousedown", event => {
      /** 鼠标或者手指点击时，生成一个context对象，同时把context存入到contexts(Map)里 */
      // 为每个鼠标按钮的点击事件创建一个context
      // mousedown事件event.button枚举值：0左键 1中键 2右键
      let context = Object.create(null);
      contexts.set("mouse" + (1 << event.button), context) // 左mouse1 中mouse2 右mouse4 

      recognize.start(event, context)

      // mousemove事件中event.buttons有多个鼠标的event.button相加获得
      // mousemove事件event.button枚举值：1左键 2右键 4中键
      let mousemove = event => {
        let button = 1;
        while (button <= event.buttons) { // 0b11111  
          if (button & event.buttons) { // 掩码成立,表示存在button这个鼠标键被按下

            let key;
            if (button === 2) {
              key = 4;
            } else if (button === 4) {
              key = 2;
            } else {
              key = button
            }
            let context = contexts.get("mouse" + key);
            recognize.move(event, context)
          }
          button = button << 1
        }

      }
      let mouseup = event => {
        let context = contexts.get("mouse" + (1 << event.button))
        recognize.end(event, context)
        contexts.delete("mouse" + (1 << event.button))
        if (event.buttons === 0) {
          document.removeEventListener("mousemove", mousemove)
          document.removeEventListener("mouseup", mouseup)
          isListeningMouse = false;
        }
      }
      if (!isListeningMouse) {
        document.addEventListener("mousemove", mousemove) // 将监听事件绑定在document上
        document.addEventListener("mouseup", mouseup)
        isListeningMouse = true;
      }

    })

    /** 手指事件 模板
     * touchmove必然是在touchstart以后才会触发，所以不用放在touchstart里面
     * touchstart时为每个手指的点击事件创建一个context
     */
    element.addEventListener("touchstart", event => {
      for (let touch of event.changedTouches) {
        let context = Object.create(null);
        contexts.set(touch.identifier, context)
        recognize.start(touch, context)
      }
    })
    element.addEventListener("touchmove", event => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier)
        recognize.move(touch, context)
      }
    })
    element.addEventListener("touchend", event => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier)
        recognize.end(touch, context)
        contexts.delete(touch.identifier)
      }
    })
    element.addEventListener("touchcancel", event => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier)
        recognize.cancel(touch, context)
        contexts.delete(touch.identifier)
      }
    })

  }
}

export class Recognize {
  constructor(dispatcher) { // 传入new Dispatcher()
    this.dispatcher = dispatcher
  }

  // isPan 移动10px；isTap点击；isPress长按500ms
  start(point, context) {
    context.startX = point.clientX, context.startY = point.clientY;
    context.points = [{
      t: Date.now(),
      x: point.clientX,
      y: point.clientY,
    }]

    context.isTap = true;
    context.isPan = false;
    context.isPress = false;

    context.handler = setTimeout(() => { // 2.进入press状态线
      this.dispatcher.dispatch("press", {})
      context.isTap = false;
      context.isPan = false;
      context.isPress = true;
      context.handler = null;
    }, 500)
  }

  move(point, context) {
    let dx = point.clientX - context.startX, dy = point.clientY - context.startY;
    if (!context.isPan && dx ** 2 + dy ** 2 > 100) { // 3.进入pan状态线
      context.isTap = false;
      context.isPan = true;
      context.isPress = false;
      context.isVertical = Math.abs(dx) < Math.abs(dy)
      this.dispatcher.dispatch("panStart", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical  // 上下还是左右滑动 启动pan
      })
      clearTimeout(context.handler)
    }

    if (context.isPan) {
      this.dispatcher.dispatch("pan", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical // 上下还是左右滑动
      })
    }
    context.points = context.points.filter(item => Date.now() - item.t < 500)
    context.points.push = {
      t: Date.now(),
      x: point.clientX,
      y: point.clientY,
    }
  }

  end(point, context) {
    if (context.isTap) {
      this.dispatcher.dispatch("tap", {})
      clearTimeout(context.handler)
    }
    if (context.isPress) {
      this.dispatcher.dispatch("pressend", {})
    }
    context.points = context.points.filter(item => Date.now() - item.t < 500)
    // 速度判断
    let v, d;
    if (context.points.length == 0) {
      v = 0;
    } else {
      d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y) ** 2)
      v = d / (Date.now() - context.points[0].t) // 手指的点击到滑动结束可能不需要500ms
    }
    if (v > 1.5) { // 5.进入flick状态线
      context.isFlick = true;
      this.dispatcher.dispatch("flick", { // flick是特殊情况下的pan
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical, // 上下还是左右滑动
        isFlick: context.isFlick,
        v: v
      })
    } else {
      context.isFlick = false;
    }

    if (context.isPan) {
      this.dispatcher.dispatch("panend", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical, // 上下还是左右滑动
        isFlick: context.isFlick
      })
    }
  }

  cancel(point, context) { // 4.关闭所有状态线
    context.isTap = false;
    context.isPan = false;
    context.isPress = false;
    clearTimeout(context.handler)
    this.dispatcher.dispatch("cancel", {}) // flick是特殊情况下的pan

  }

}


/** 动态创建和派发事件 */
export class Dispatcher {
  constructor(element) {
    this.element = element
  }
  dispatch(type, properties) {
    let event = new Event(type);
    for (let name in properties) {
      event[name] = properties[name]
    }
    this.element.dispatchEvent(event)
  }
}

// 可以使用闭包
// function dispatch(element) {
//   return function (type, properties) {
//     let event = new Event(type);
//     for (let name in properties) {
//       event[name] = properties[name]
//     }
//     element.dispatchEvent(event)
//   }
// }

/**
 * @param { String } element 传入dom元素创建new Listen();
 * @desc document.documentElement.addEventListener("tap", () => { }); 
 */
export function enableGesture(element) {
  new Listen(element, new Recognize(new Dispatcher(element)))
}
