学习笔记

# 1.学习手势的基础知识

# 2.抽象出鼠标和手势模板，使用 4 个函数来统一管理事件

# 3.根据图片完成 start 后的 3 个不同分支

# 4.创建全集 contexts(Map)，以应付多个手指/和鼠标按键的情况

    在 mousedown 时初始化一个 context 上下文对象 插入到 contexts 中，在 start 函数中初始化 isTap isPan isPress handler 这些状态变量，使得每个手指/鼠标维护自己的 context 对象

# 5.动态创建和派发事件：tap 事件

# 6.实现一个 flick 事件：判断最近 500ms 的速度是否符合 1.5m/ms

# 7.把代码封装成一个独立的函数，可以自由的被调用

    press 长按
    panstart 滑动开始
    pan 滑动
    tap 点击
    panend 滑动结束
    pressend 长按结束
    flick
    cancel
