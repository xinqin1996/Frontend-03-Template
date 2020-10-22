学习笔记

# reactive
## 1：全局变量的作用
    1.运行effect，清空usedReactivities，下次运行effect，会在原有的基础上新增handler
    2.handler()  => ro.a => 在usedReactivities进行注册对象[ro, a]
    3.通过usedReactivities， 来注册handlers的[handler]
    4.ro.a = val 时，去handlers中寻找注册的[handler], handlers只有在运行effect才会注册
    5.同时通过reactivities防止二次注册

## 2：实现绑定的运行机制
    1.let ro = reactive({r:100, g:100, b:100});  先创建proxy（usedReactivities）
    2.effect(() => { ... = obj.a })              usedReactivities：把事件注册 和 {r:100, g:100, b:100} 联系在一起
    3. obj.a 只为 obj.a 注册事件
    4.usedReactivities                           由 obj.a 触发get生成
    5.effect(() => {  })                         重新生成usedReactivities，在原有handlers的基础上添加新的handler
    6.obj.a = val                                触发set,遍历执行handlers里对应代理对象的[handler]

# drapdrop
    1. 实现元素在文字中随意移动，不改变元素布局 
    2. 将range保存在ranges中
    3. mousemove时遍历ranges
    4. 使用range.getClientRects获取单个文字的位置信息，
    5. 判断哪个range离鼠标的位置最近
    6. 离鼠标近的range.insertNode(drapable)
    7. 来达到drapable元素跟随鼠标的作用