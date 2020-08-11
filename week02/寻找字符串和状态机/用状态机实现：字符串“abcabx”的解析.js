function match(string){
  // 初始化状态
  let state = start;
  // 状态循环
  for(let c of string){
    state = state(c)
  }
  // 结束状态判断
  return state === end
}

// 初始化状态
function start(c){
  if(c === 'a'){
    return foundA // 进入下一个状态
  }else{
    return start // 停留在第一个状态
  }
}

// 结束状态 (一直返回结束状态)
function end(c){
  return end
}

// 其他状态
function foundA(c){
  if(c === "b"){
    return foundB
  }else{
    return start(c)
  }
}
function foundB(c){
  if(c === "c"){
    return foundC
  }else{
    return start(c)
  }
}
function foundC(c){
  if(c === "a"){
    return foundA2
  }else{
    return start(c)
  }
}
function foundA2(c){
  if(c === "b"){
    return foundB2
  }else{
    return start(c)
  }
}
function foundB2(c){
  if(c === "x"){
    return end
  }else{
    return foundB(c)
  }
}

console.log(match('abcabcabxjj'))
