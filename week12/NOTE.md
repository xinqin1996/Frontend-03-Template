学习笔记

reactive
1：全局变量的作用
运行effect，清空usedReactivities，下次运行effect，会在原有的基础上新增handler
handler()  => ro.a => 在usedReactivities进行注册对象[ro, a]
通过usedReactivities， 来注册handlers的[handler]
ro.a = val 时，去handlers中寻找注册的[handler], handlers只有在运行effect才会注册
同时通过reactivities防止二次注册

2：实现绑定的运行机制
let ro = reactive({r:100, g:100, b:100});  先创建proxy（usedReactivities）
effect(() => { ... = obj.a })              usedReactivities：把事件注册 和 {r:100, g:100, b:100} 联系在一起
                                            obj.a 只为 obj.a 注册事件
usedReactivities                           由 obj.a 触发get生成
effect(() => {  })                         重新生成usedReactivities，在原有handlers的基础上添加新的handler
obj.a = val                                触发set,遍历执行handlers里对应代理对象的[handler]