/** 手动轮播，优化，只改变特定div的位置 */
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

        let position = 0; // J记录当前是哪个位置

        this.root.addEventListener("mousedown", (event) => {
            let children = this.root.children;
            let startX = event.clientX;
            let move = (event) => { 
                let x = event.clientX - startX;
                
                let current = position - ((x - x % 471) / 471)// 计算当前在屏幕上的位置，可能左右便宜
                for (let offset of [-1, 0, 1]) { 
                    let pos = current + offset;
                    pos = (pos + children.length) % children.length // 将可能的pos复数转化为正数
                    children[pos].style.transition = 'none' // 鼠标移动时去掉transition
                    children[pos].style.transform = `translateX(${ -pos * 471 + 471 * offset + x % 500}px)`
                } 
            }
            let up = (event) => { 
                let x = event.clientX - startX;
                position = position - Math.round(x / 471) // 鼠标移开时，计算回滚的位置 
                for (let offset of [ 0, -Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) { 
                    let pos = position + offset;
                    pos = (pos + children.length) % children.length // 将可能的pos复数转化为正数
                    children[pos].style.transition = '' // 鼠标移动时去掉transition
                    children[pos].style.transform = `translateX(${ -pos * 471 + 471 * offset}px)`
                } 
                document.removeEventListener("mousemove", move )
                document.removeEventListener("mouseup", up )
            }
            document.addEventListener("mousemove", move)
            document.addEventListener("mouseup", up)            
        })        

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


a.mountTo(document.body) // 必须要重写这个方法， a可能是class实例