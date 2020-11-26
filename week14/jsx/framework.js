export function createElement(type, attributes, ...children) {

    let element; 
    if (typeof type === "string") {
        element = new ElementWrapper(type);
    } else { 
        element = new type // type实例
    }
    
    // 插入属性
    for (let name in attributes) { 
        element.setAttribute(name, attributes[name])
    }
    // 插入节点
    for (let child of children) { 
        if (typeof child == "string") { 
            child = new TexttWrapper(child)
        }
        element.appentChild(child)
        
    }
    return element
}

export class Component { 
    constructor(type) { 
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

// 因为普通的div没有mountTo操作，定义一个class
class ElementWrapper extends Component { 
    constructor(type) { 
        this.root = document.createElement(type)
    }
}

class TexttWrapper extends Component { 
    constructor(content) { 
        this.root = document.createTextNode(content)
    }
}