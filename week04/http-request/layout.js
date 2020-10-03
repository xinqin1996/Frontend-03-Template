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

    // 尺寸适应子元素: 所有元素都可以收入父元素
    // 父元素尺寸 = 所有子元素相加
    var isAutoMainSize = false;
    if(!style[mainSize]) {
        elementStyle[mainSize] = 0;
        for(var i = 0; i < items.length; i++) {
            var item = items[i];
            var itemStyle = getStyle(item);
            if(itemStyel[mianStyle] === null) {
                itemStyle[mianStyle] = 0
            }
            if(itemStyle[mainSize] !== null || itemStyle[mainSize]) {
                elementStyle[mainSize] += itemStyle[mainSize]
            }
        }
        isAutoMainSize = true;
    }

    // ----------分行----------
    var flexLine = [];
    var flexLines = [flexLine]; 
    
    var mainSpace = elementStyle[mainSize]; // 初始化剩余空间
    var crossSpace = 0; // 初始化交叉轴
    // 循环子元素
    for(var i = 0; i < items.length; i++) {
        var item = item[i];
        // 初始化子元素样式
        var itemStyle = getStyle(item);
        if(itemStyel[mianStyle] === null) {
            itemStyle[mianStyle] = 0
        }

        // 在元素入行后，总是要计算crossSize 和 mainSpace
        // 1 直接入行
        if(itemStyle.flex) {
            flexLine.push(item) // 不参与mainSpace计算
        // *******2 符合下面两种情况，直接入行*******
        } else if(style.flexWrap === 'nowarp' || isAutoMainSize) {
            mainSpace -= itemStyle[mainSize];
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]); // 计算最高行高
            }
            flexLine.push(item);
        } else {
        // 3 判断尺寸
            if(itemStyle[mainSize] > style[mainSize]) {
                itemStyle[mainSize] = style[mainSize]
            }
            // 如果元素大于剩余空间，换行
            if(mainSpace < itemStyle[mainSize]) {
                flexLine.mainSpace = mainSpace; // 保存旧行的属性
                flexLine.crossSpace = crossSpace;
                // 另起一行
                flexLine = [item];
                flexLines.push(flexLine); // 入栈
                mainSpace = style[mainSize]; // 初始化第二行剩余空间
                crossSpace = 0;
            } else {
                // 如果元素小于剩余空间
                flexLine.push(item)
            }
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]); // 计算最高行高
            }
            mainSpace -= itemStyle[mainSize];
        }
    }
    // 循环结束，最后一个flexLine赋值
    flexLine.mainSpace = mainSpace; // 保存旧行的属性
    // flexLine.crossSpace = crossSpace;
    if(style.flexWrap === 'nowrap' || isAutoMainSize) {
        flexLine.crossSpace = (style[crossStyle] !== undefined ? style[crossStyle] : crossSpace)
    } else {
        flexLine.crossSpace = crossSpace;
    }

    // ---------计算主轴--------
    // 只会发生在wrap: nowarp; 单行的情况下发生
    if(mainSpace <= 0) { // < winter写的是<
        var scale = style[mainSize] / (style[mainSize] - mainSpace); // 压缩比例
        var currentMain = mainBase; // 起始位置计算
        for(var i = 0; i < items.length; i++) {
            var item = item[i];
            // 初始化子元素样式
            var itemStyle = getStyle(item);
            if(itemStyel.flex) {
                style[mainSize] = 0; // 没有宽度
            }
            
            itemStyle[mainSize] = itemStyle[mainSize] * scale;
            
            itemStyle[mainStart] = currentMain // 子元素左边位置
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize] // 子元素右边位置
            currentMain = itemStyle[mainEnd] // 起始位置更新
        }
    } else {
        // ---------多行的情况下---------
        // 1 一行被flex子元素占满
        // 2 根据justifyContent来排列
        flexLines.forEach((items) => {

            var mainSpace = items.mainSpace;
            // 计算所有子元素的flex
            var flexTotal = 0;
            for(var i = 0; i < items.length; i++) {
                var item = item[i];
                // 初始化子元素样式
                var itemStyle = getStyle(item);
                if(itemStyel.flex !== null && itemStyle.flex !== (void 0)) {
                    flexTotal += itemStyel.flex;
                }
            } 
            
            // 1 一行被flex子元素占满
            // 存在flex元素，剩下的空间将被等比划分
            if(flexTota > 0 ) {
                var currentMain = mainBase;
                for(var i = 0; i < items.length; i++) {
                    var item = item[i];
                    var itemStyle = getStyle(item);

                    if(itemStyel.flex) { // 平分剩下空间
                        itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex
                    }
                    itemStyle[mainStart] = currentMain // 子元素左边位置
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize] // 子元素右边位置
                    currentMain = itemStyle[mainEnd] // 起始位置更新
                    
                } 
            // 2 根据justifyContent来排列
            } else {
                if(style.justifyContent === 'flex-start') {
                    var currentMain = mainBase;
                    var step = 0;
                }
                if(style.justifyContent === 'flex-end') {
                    var currentMain = mainSpace * mainSign + mianBase; // 剩余空间
                    var step = 0;
                }
                if(style.justifyContent === 'center') {
                    var currentMain = mainBase;
                    var step = 0;
                }
                if(style.justifyContent === 'space-between') {
                    var step = mainSpace / (items.length - 1) * mainSign
                    var currentMain = mainBase;
                }
                if(style.justifyContent === 'space-around') {
                    var step = mainSpace / (items.length) * mainSign
                    var currentMain =  step / 2 +  mainBase;
                }
                
                // 所有元素都是一个算法
                for(var i = 0; i < items.length; i++) {
                    var item = items[i];
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                    currentMain = itemStyle[mainEnd] + step;
                }
            }
        })
    }

    // ********计算交叉轴，这一块直接看视屏*********
    // compute the cross axis sizes
    var crossSpace;

    if(!style[crossSize]) {
        crossSpace = 0;
        elementStyle[crossSize] = 0;
        for (var i = 0; i < flexLines.length; i++) {
            elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace;
        }
    } else {
        crossSpace = style[crossSize]
        for (var i = 0; i < flexLine.length; i++) {
            crossSpace -= flexLine[i].crossSpace
        }
    }

    if(style.flexWrap === 'wrap-reverse') {
        crossBase = style[crossSize];
    } else {
        crossBase = 0;
    }
    
    // 计算行数
    var lineSize = style[crossSize] / flexLines.length;


}

module.exports = layout;