/**    自动轮播    */
import { createElement, Component } from "./framework"

/**  创建的Div class
// ------Div --------
// 为 class创建constructor setAttribute 这些dom操作
class Div {  
    constructor() { 
        this.root = document.createElement("div")
    }
    setAttribute(name, value) { 
        this.root.setAttribute(name, value)
    }
    appentChild(child) { 
        // this.root.appentChild(child )
        child.mountTo(this.root) // 此时的child为一个class实例，this.root.appentChild(child )会报错
    }
    mountTo(parent) { 
        parent.appendChild(this.root)
    }
}

let a = <Div id="a">
    <span>11</span>
    <span>11</span>
    <span>11</span>
</Div>
*/
// ------Div --------


class Carousel extends Component { 
    constructor() { 
        super()
        this.attributes = Object.create(null)
    }
    // setAttribute方法重写
    setAttribute(name, value) { 
        this.attributes[name] = value // 保存img列表
    }
    render() {  
        console.log(this.attributes.src)
        this.root = document.createElement("div");
        this.root.classList.add('carousel')
        for (let r of this.attributes.src) { 
            let child = document.createElement("div");
            child.style.backgroundImage = `url(${r})`
            this.root.appendChild(child)
        }

        /** 初步完成移动轮播 */
        let currentIndex = 0;
        setInterval(() => { 
            let children = this.root.children;
            let nextIndex = (currentIndex + 1) % children.length;

            let current = children[currentIndex]
            let next = children[nextIndex]

            next.style.transition = "none"; // 去掉transition，在移动
            next.style.transform = `translateX(${100 - nextIndex * 100}%)`
            
            setTimeout(() => { // 下一帧，从新添加transition
                next.style.transition = "";
                current.style.transform = `translateX(${-100 - currentIndex * 100}%)`
                next.style.transform = `translateX(${- nextIndex * 100}%)`

                currentIndex = nextIndex
            }, 16)
        }, 3000)
        /** 初步完成移动轮播 */
        

        return this.root
    }
    mountTo(parent) { 
        parent.appendChild(this.render()) // 将创建实例提取到mountTo方法中
    }
}

let d = [
    "https://static.web.sdo.com/dn/pic/dn_act/wallpaper/sgbqg/1600x1200.jpg",
    "https://static.web.sdo.com/dn/pic/dn_act/wallpaper/2007lk/1280x1024.jpg",
    "https://static.web.sdo.com/dn/pic/dn_act/wallpaper/2007qd/1280x1024.jpg",
]

let a = <Carousel src={d}/>


// document.body.appendChild(a)

a.mountTo(document.body) // 必须要重写这个方法， a可能是class实例