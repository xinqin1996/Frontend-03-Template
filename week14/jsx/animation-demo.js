import { TimeLine, Animation } from "./animation"
import { linear } from "./ease"

// 创建时间线
let t1 = new TimeLine();

let animation = new Animation(document.querySelector("#el").style, "transform", 1, 500, 4000, 500, linear, (v) => { return `translateX(${v}px)` })

// 启动时间线
t1.start()

// 添加动画
t1.add(animation) // 运行后执行add操作

// 点击事件
document.querySelector("#pause-button").addEventListener("click", () => { t1.pause() })
document.querySelector("#resume-button").addEventListener("click", () => { t1.resume() })
