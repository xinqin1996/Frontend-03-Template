/** 3-手势点击根据不同情况进入不同的状态线 */

/**
 * 鼠标点击事件 模板
 */
let element = document.documentElement;

element.addEventListener("mousedown", event => {
  console.log(event)
  start(event)
  let mousemove = event => {
    move(event)
  }
  let mouseup = event => {
    end(event)
    element.removeEventListener("mousemove", mousemove)
    element.removeEventListener("mouseup", mousemove)
  }
  element.addEventListener("mousemove", mousemove)
  element.addEventListener("mouseup", mouseup)
})

/** 手指事件 模板
 * touchmove必然是在touchstart以后才会触发，所以不用放在touchstart里面
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
// let handler;
// let startX, startY;
// let isPan = false, isTap = true, isPress = false; // 1.默认起始tap状态线

let start = (point, context) => {
  context.startX = point.clientX, startY = point.clientY;

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
  if (!isPan && dx ** 2 + dy ** 2 > 100) { // 3.进入pan状态线
    context.isTap = false;
    context.isPan = true;
    context.isPress = false;
    console.log("panStart")
    clearTimeout(context.handler)
  }

  if (isPan) {
    console.log("pan")
  }
}

let end = (point, context) => {
  if (context.isTap) {
    clearTimeout(context.handler)
    console.log("tap")
  }
  if (context.isPan) {
    console.log("Pan")
  }
  if (context.isPress) {
    console.log("Press")
  }
}

let cancel = (point, context) => { // 4.关闭所有状态线
  context.isTap = false;
  context.isPan = false;
  context.isPress = false;
  clearTimeout(context.handler)
}


