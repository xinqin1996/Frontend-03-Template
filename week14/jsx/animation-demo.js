import { TimeLine, Animation } from "./animation"

console.log(123123)
let t1 = new TimeLine();

let ani = new Animation(document.querySelector("#el").style, transform, 1, 100, 1000, null, (v) => { return `translateX(${v}px)` })

time.start()

t1.add(ani) // 运行后执行add操作