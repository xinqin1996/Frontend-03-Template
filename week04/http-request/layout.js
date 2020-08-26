// 对style进行解析
function getStyle(element){
    if(!element.style)
        element.style = {};
    
    for(let prop in element.computedStyle) {
        var p = element.computedStyle.value;
        element.style[prop] = element.computedStyle[prop].value;

        // 解析 px 属性
        if(element.style[prop].toString().match(/px$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }
        // 解析 纯数字
        if(element.style[prop].toString().match(/^[0-9\.]+$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }
    }
    return element.style;
}

// layout函数
function layout(element){
    if(!element.computedStyle)
        return;
    var elementStyle = getStyle(element);
    if(elementStyle.display !== 'flex') // 跳过
        return;
    var items = element.children.filter(e => e.type === 'element');

    // -------对元素的孩子进行排序-------
    items.sort((a, b) => {
        return (a.order || 0) - (b.order || 0);
    })
    // -------元素自身的属性--------
    var style = elementStyle // 获取处理后的css对象

    // width , height 置为空
    ['width', 'height'].forEach(size => {
        if(style[size] === 'auto' || style[size] === '') {
            style[size] = null;
        } 
    })

    // 设置默认值
    if(!style.flexDirection || style.flexDirection === 'auto') {
        style.flexDirection = 'row'
    }
    if(!style.alignItems || style.alignItems === 'auto') {
        style.alignItems = 'stretch'
    }
    if(!style.justifyContent || style.justifyContent === 'auto') {
        style.justifyContent = 'flex-start'
    }
    if(!style.flexWrap || style.flexWrap === 'auto') {
        style.flexWrap = 'nowrap'
    }
    if(!style.alignContent || style.alignContent === 'auto') {
        style.alignContent = 'stretch'
    }

    var mainSize, mainStart, mainEnd, mainSign, mianBase, 
        crossSize, crossStart, crossEnd, crossSign, crossBase,
    if(style.flexDirection === 'row') {
        mainSize = "width";
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if(style.flexDirection === 'row-reverse') {
        mainSize = "width";
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if(style.flexDirection === 'column') {
        mainSize = "height";
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }
    if(style.flexDirection === 'column-reverse') {
        mainSize = "height";
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }
    if(style.flexWrap === 'wrap-reverse') { // 换行，第一行在下方。
        var tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        crossSign = -1;
    } else {
        crossBase = 0;
        crossSign = 1;
    }
}