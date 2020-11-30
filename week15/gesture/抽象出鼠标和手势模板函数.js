/** 2-抽象出鼠标和手势模板函数 */

/**
 * 鼠标点击事件 模板
 */
let element = document.documentElement;

element.addEventListener("mousedown", event => {
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
element.addEventListener("touchstart", event => {
  // console.log(event.changedTouches)
  for (let touch of event.changedTouches) {
    start(touch)
  }
})
element.addEventListener("touchmove", event => {
  for (let touch of event.changedTouches) {
    move(touch)
  }
})
element.addEventListener("touchend", event => {
  for (let touch of event.changedTouches) {
    end(touch)
  }
})
element.addEventListener("touchcancel", event => {
  for (let touch of event.changedTouches) {
    cancel(touch)
  }
})

/**
 * 封装事件
 */
let start = (point) => {
  console.log("start", point.clientX, point.clientY)
}
let move = (point) => {
  console.log("move", point.clientX, point.clientY)
}
let end = (point) => {
  console.log("end", point.clientX, point.clientY)
}
let cancel = (point) => {
  console.log("cancel", point.clientX, point.clientY)
}


