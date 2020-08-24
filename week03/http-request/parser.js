// parser接受HTML文本作为参数，返回一个DOM树
const css = require('css')

const EOF = Symbol("EOF")

let currentToken = null;
let currentAttribute = null;

let stack = [{type: 'document', children:[]}];
let currentTextNode = null;

// addCSSRules,把css规则暂存到一个数组里
let rules = [];
function addCSSRules(text){
    var ast = css.parse(text);
    rules.push(...ast.stylesheet.rules)
}

// match 匹配选择器
// .a #a div
function match(element, selector){
    if(!selector || !element.attributes) 
        return false;
    
    if(selector.charAt(0) == '#') {
        var attr = element.attributes.filter(attr => attr.name === 'id')[0];
        if(attr && attr.value === selector.replace('#', ''));
            return true
    } else if(selector.charAt(0) == '.') {
        var attr = element.attributes.filter(attr => attr.name === 'class')[0];
        if(attr && attr.value === selector.replace('.', ''));
            return true
    } else {
        if(element.tagName === selector)
            return true
    }
    return false;
}

// 比较选择器优先级
function specificity(selector){
    var p = [0, 0 ,0, 0];
    var selectorParts = selector.split(' ');
    for(var part of selectorParts) {
        if(part.charAt(0) == '#') {
            p[1] += 1;
        } else if(part.charAt(0) == '.') {
            p[2] += 1;
        } else {
            p[3] += 1;
        }
    }
    return p;
}

function compare(sp1, sp2){
    if(sp1[0] - sp2[0]) // 只要结果不为0抛出
        return sp1[0] - sp2[0]
    if(sp1[1] - sp2[1]) 
        return sp1[1] - sp2[1]
    if(sp1[2] - sp2[2]) 
        return sp1[2] - sp2[2]
    return sp1[3] - sp2[3]
}

// startTag阶段，为元素添加css属性
function computeCSS(element){
    var elements = stack.slice().reverse(); // 获取栈里所有父元素
    if(!element.computedStyle)
        element.computedStyle = {};
    
    // 每计算一个元素，都要遍历所有css-rules
    for(let rule of rules) {
        var selectorParts = rule.selectors[0].split(" ").reverse();
        if(!match(element, selectorParts[0])) 
            continue;
        
        let matched = false;

        // 对栈里的元素for循环匹配
        var j = 1;
        for(var i = 0; i < elements.length; i++) {
            if(match(elements[i], selectorParts[j])) {
                j++; // j达标时，循环就可以结束了
            }
        }
        if(j >= selectorParts.length) // rules全部匹配
            matched = true;
        
        if(matched) {
            var sp = specificity(rule.selectors[0])
            var computedStyle = element.computedStyle;
            for(var declaration of rule.declarations) {
                if(!computedStyle[declaration.property])
                    computedStyle[declaration.property] = {}

                // 如果不存在
                if(!computedStyle[declaration.property].specificity) {
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                    // 此时，sp才是新来的选择器
                } else if(compare(computedStyle[declaration.property].specificity, sp) < 0) {
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                }
                // computedStyle[declaration.property].value = declaration.property
            }
        }
    }
}

function emit(token){
    let top = stack[stack.length - 1];
    if(token.type == 'startTag') {
        let element = {
            type: 'element',
            children: [],
            attributes: []
        }
        element.tagName = token.tagName;
        
        for(let p in token) {
            if(p != 'type' && p != 'tagName') {
                element.attributes.push({
                    name: p,
                    value: token[p]
                })
            }
        }

        computeCSS(element) // 入栈前进行计算

        top.children.push(element); // 入children
        // element.parent = top; // 父子相互嵌套

        if(!token.isSelfClosing)
            stack.push(element) // 入栈
        
        currentTextNode = null;

    } else if(token.type == 'endTag') {
        // console.log('top',top)
        // console.log('token',token)
        if(top.tagName != token.tagName) {
            throw new Error('--error--',"Tag start end doesn't match!")
        } else {
            // +++++遇到style标签时，执行添加css规则+++++++
            if(top.tagName === 'style') {
                addCSSRules(top.children[0].content) // 把css元素的文本解析 
            }
            stack.pop() // 出栈
        }
        currentTextNode = null;

    } else if(token.type == 'text'){
        if(currentTextNode == null) { // 如果为空，创建元素并入children
            currentTextNode = { // 这里相当于创建一个新的对象
                type: 'text',
                content: ''
            }
            top.children.push(currentTextNode)
        }
        currentTextNode.content += token.content;
    }
}


function data(c){
    if(c == '<') {
        return tagOpen;
    } else if(c == EOF) {
        emit({
            type: 'EOF'
        })
        return ;
    } else {
        emit({
            type: 'text',
            content: c
        })
        return data;
    }
}

function tagOpen(c){
    if(c == '/') {
        return endTagOpen;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: ''
        }
        return tagName(c)
    } else {
        return ;
    }
}

// </html
function endTagOpen(c){
    if(c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: ''
        }
        return tagName(c)
    } else if(c == '>') {
        
    } else if(c == EOF) {

    }
}
// <html   </html
function tagName(c){ 
    if(c.match(/^[\t\n\f ]$/)) { // 匹配到空格
        return beforeAttributeName;
    } else if(c == '/') {
        return selfCloseStartTag;
    } else if(c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c;
        return tagName;
    } else if(c == ">") { // 结束时，emit
        emit(currentToken)
        return data;
    } else {
        return tagName;
    }
    
}

// <html name="jxq">
function beforeAttributeName(c){
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if(c == '/' || c == '>' || c == EOF) {
        return afterAttributeName(c) // 属性结束
    } else if(c == '=') {
        
    } else {
        currentAttribute = {
            name: '',
            value: ''
        }
        return attributeName(c);
    }
}

// <html name
function attributeName(c){
    if(c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) { // 属性结束
        return afterAttributeName(c)
    } else if(c == '=') {
        return beforeAttributeValue
    } else if(c == '\u0000') {
        
    } else if(c == "\"" || c == "\"" || c == "<" ) {
        
    } else { // 手机attribute
        currentAttribute.name += c; // 凭借属性名
        return attributeName;
    }
}

// <html name=
function beforeAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) { 
        return afterAttributeName;
    } else if(c == "\"") {
        return doubleQuotedAttributeValue;
    } else if(c == "\'") {
        return singleQuotedAttributeValue
    } else if(c == ">") {
        
    } else { // 手机attribute
        return UnquotedAttributeValue(c)
    }
}

// <html name="
function doubleQuotedAttributeValue(c){
    if(c == "\"") { // 获取属性
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue
    } else if(c == '\u0000') {
        
    } else if(c == EOF) {
        
    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue
    }
}

// <html name='
function singleQuotedAttributeValue(c){
    if(c == "\'") { // 获取属性
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue
    } else if(c == '\u0000') {
        
    } else if(c == EOF) {
        
    } else {
        currentAttribute.value += c;
        return singleQuotedAttributeValue
    }
}

// <html name='jxq'  <html name="jxq"
function afterQuotedAttributeValue(){
    if(c.match(/^[\t\n\f ]$/)) { 
        return beforeAttributeName;
    } else if(c == "/") {
        return selfClosingStartTag;
    } else if(c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;   
        emit(currentToken)
        return data;
    } else if(c == EOF) {
        
    } else {
        // currentAttribute.value += c;
        // return doubleQuotedAttributeValue
    }
}

// <html name=jxq
function afterQuotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)) { 
        currentToken[currentAttribute.name] = currentAttribute.value; 
        return beforeAttributeName;
    } else if(c == "/") {
        currentToken[currentAttribute.name] = currentAttribute.value; 
        return selfClosingStartTag;
    } else if(c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;   
        emit(currentToken)
        return data;
    } else if(c == "\u0000") {
        
    } else if(c == "\"" || c == "'" || c == '<' || c == '=' || c == '`') { 

    } else if(c == EOF) {
    
    } else {
        currentAttribute.value += c;
        return UnquotedAttributeValue;
    }
        
}

function selfClosingStartTag(c){
    if(c == '>'){
        currentToken.isSelfClosing = true;
        return data
    } else if(c == "EOF") {
        
    } else {
        
    }
}

module.exports.parseHTML = function parserHTML(html){
    let state = data;
    for(let c of html) { // 进行状态机解析
        state = state(c)
    }
    state = state(EOF)
    return stack[0] // 导出dom对象{type: 'document', children:[...]}
}