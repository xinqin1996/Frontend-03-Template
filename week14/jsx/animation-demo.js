import { TimeLine, Animation } from "./animation"

// 创建时间线
let t1 = new TimeLine();

// object, property, startVal, endVal, duration, delay, timingFunction, template
let animation = new Animation(document.querySelector("#el").style, "transform", 1, 500, 4000, 0, null, (v) => { return `translateX(${v}px)` })

// 启动时间线
t1.start()

// 添加动画
t1.add(animation) // 运行后执行add操作

// 点击事件
document.querySelector("#pause-button").addEventListener("click", () => { t1.pause() })
document.querySelector("#resume-button").addEventListener("click", () => { t1.resume() })
