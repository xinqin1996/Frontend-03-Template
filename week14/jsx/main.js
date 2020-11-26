/** 手动轮播，优化，只改变特定div的位置 */
import { createElement, Component } from "./framework"
import { Carousel } from "./carousel"
import { TimeLine, Animation } from "./animation"

let d = [
  "https://static.web.sdo.com/dn/pic/dn_act/wallpaper/sgbqg/1600x1200.jpg",
  "https://static.web.sdo.com/dn/pic/dn_act/wallpaper/2007lk/1280x1024.jpg",
  "https://static.web.sdo.com/dn/pic/dn_act/wallpaper/2007qd/1280x1024.jpg",
]

let a = <Carousel src={d} />

window.time = new TimeLine();
window.animation = new Animation({}, a, 1, 100, 1000, null)
// time.add(animation) // 运行后执行add操作
time.start()

console.log(123)

a.mountTo(document.body) // 必须要重写这个方法， a可能是class实例