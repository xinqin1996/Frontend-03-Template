/** 3-手势点击根据不同情况进入不同的状态线 */

/**
 * 鼠标点击事件 模板
 */
let element = document.documentElement;

// 判断是否已经绑定了mousemove和mouseup事件：在手指多次mousedown的时候，mousemove和mouseup会被多次绑定，每次鼠标抬起，会触发两次同一个按键的mouseup事件，导致报错
let isListeningMouse = false;

element.addEventListener("mousedown", event => {
  /** 鼠标或者手指点击时，生成一个context对象，同时把context存入到contexts(Map)里 */
  // 为每个鼠标按钮的点击事件创建一个context
  // mousedown事件event.button枚举值：0左键 1中键 2右键
  let context = Object.create(null);
  contexts.set("mouse" + (1 << event.button), context) // 左mouse1 中mouse2 右mouse4 
  console.log("mousedown", event.button)

  start(event, context)

  // mousemove事件中event.buttons有多个鼠标的event.button相加获得
  // mousemove事件event.button枚举值：1左键 2右键 4中键
  let mousemove = event => {
    console.log("mousemove", event.buttons)
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
        move(event, context)
      }
      button = button << 1
    }

  }
  let mouseup = event => {
    let context = contexts.get("mouse" + (1 << event.button))
    console.log("context", context, 1 << event.button)
    end(event, context)
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

let contexts = new Map(); // 保存每个touch的上下文信息

element.addEventListener("touchstart", event => {
  // console.log(event.changedTouches)
  for (let touch of event.changedTouches) {
    let context = Object.create(null);
    contexts.set(touch.identifier, context)
    start(touch, context)
  }
})
element.addEventListener("touchmove", event => {
  for (let touch of event.changedTouches) {
    let context = contexts.get(touch.identifier)
    move(touch, context)
  }
})
element.addEventListener("touchend", event => {
  for (let touch of event.changedTouches) {
    let context = contexts.get(touch.identifier)
    console.log("context", context)
    end(touch, context)
    contexts.delete(touch.identifier)
  }
})
element.addEventListener("touchcancel", event => {
  for (let touch of event.changedTouches) {
    let context = contexts.get(touch.identifier)
    cancel(touch, context)
    contexts.delete(touch.identifier)
  }
})

/**
 * 封装事件 context.
 */
// isPan 移动10px；isTap点击；isPress长按500ms

let start = (point, context) => {
  context.startX = point.clientX, startY = point.clientY;
  context.points = [{
    t: Date.now(),
    x: point.clientX,
    y: point.clientY,
  }]

  context.isTap = true;
  context.isPan = false;
  context.isPress = false;

  context.handler = setTimeout(() => { // 2.进入press状态线
    console.log("press")
    context.isTap = false;
    context.isPan = false;
    context.isPress = true;
    context.handler = null;
  }, 500)
}

let move = (point, context) => {
  let dx = point.clientX - context.startX, dy = point.clientY - context.startY;
  if (!context.isPan && dx ** 2 + dy ** 2 > 100) { // 3.进入pan状态线
    context.isTap = false;
    context.isPan = true;
    context.isPress = false;
    console.log("panStart")
    clearTimeout(context.handler)
  }

  if (context.isPan) {
    console.log("pan")
  }
  context.points = context.points.filter(item => Date.now() - item.t < 500)
  context.points.push = {
    t: Date.now(),
    x: point.clientX,
    y: point.clientY,
  }
}

let end = (point, context) => {
  if (context.isTap) {
    dispatch("tap", {})
    clearTimeout(context.handler)
    console.log("tap")
  }
  if (context.isPan) {
    console.log("Pan")
  }
  if (context.isPress) {
    console.log("Press")
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
    console.log("flick")
    context.isFlick = true;
  } else {
    context.isFlick = false;
  }
}

let cancel = (point, context) => { // 4.关闭所有状态线
  context.isTap = false;
  context.isPan = false;
  context.isPress = false;
  clearTimeout(context.handler)
}


/** 动态创建和派发事件 */
function dispatch(type, properties) {
  let event = new Event(type);
  for (let name in properties) {
    event[name] = properties[name]
  }
  element.dispatchEvent(event)
}
