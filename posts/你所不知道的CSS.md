---
title: 你所不知道的CSS
date: 2024-05-01
category: 前端开发
top: false
tags:
  - CSS
description: '你所不知道的CSS内容小结'
---

# 你所不知道的CSS

## 字体
### Font-family
不同操作系统下的预装字体是完全不一样的，所以即使是相同的`font-family`，也是会产生差异！

### Font-weight
所有的字体加粗并不是统一从100-900都会生效，通常只有400和700才生效，对应的就是`normal`和`bold`. 所以当有不同粗细的设计需求下，此时需要预装字体

## 权重叠加
通常我们的样式叠加的常规做法比如:
`!imporant`，但它的缺陷就是提升到最顶级后，我们没法再次进行覆盖。此时我们可以选择使用类名叠加、属性叠加的方式来提升权重
```css
.foo.foo{}
```
## currentColor
实际如`background-color`、`box-shadow`中的颜色属性，在默认不写的情况下会自动填充`currentColor`，它对应的是盒子自身的`color`.所以一些情况下可以利用这一点做到对代码的优化

## inherit、unset、initial
inherit会从父元素继承对应的属性值，而unset则看其有没有从父元素继承，有则从父元素继承属性值，没有则变为初始值（如被初始化后的元素可以通过unset恢复原本的属性值）。而initial就是把属性的值恢复到原始值

## fixed失效
核心就是父元素产生了堆叠上下文(Stacking content)，它会导致fixed的视口不在基于屏幕。共有七种情况：
1. transform不为none
2. transofrm-style:preserve-3d
3. will-change
4. contain:paint
5. filter不为none
6. backdrop-filter不为none

## 3D失效
CSS混合模式会使3D的盒子重新变回2D，其原因就是盒子本身会因为混合模式重新创建一个渲染平面，这个渲染平面不支持3D

## 100vh失效
在移动端谷歌浏览器，对于视口单位的计算，会把地址栏也计算在内，`所以会出现100vh导致的滚动条出现`.占满一屏更好的方案：
```css
html,body{
  height:100%;
}
div{
  height:100%;
}
```
### 后续更酷的容器单位
`cqw`、`cqh` 基于容器的百分比进行计算，不受任何其他的因素影响

## 替换元素
替换元素不存在伪元素，因为这些标签本身就已经完全替换掉了，作为替换元素的标签有：
`audio canvas embed iframe img input object video`
#### 对于图片失效的小技巧
我们可以给图片的伪元素增加这个属性得到描述
```css
.img::after{
 content:attr(alt);
}
```
## overflow与fixed
如果我们希望一个包含了`fixed`的子元素的父盒子自身的`overflow:hidden`生效，需要怎么做？
> 产生堆叠上下文，让fixed基于父盒子
```css
.f{
 overflow:hidden;
 transform:translate3d(0,0,0)
}
.c{
 position:fixed;
}
```

### 不用overflow隐藏元素
`contain:paint` 在非元素自身内时不做这个元素的渲染，它是一个作为优化手段出现的属性
`clip-path` 裁剪一个范围，超出范围的元素将不在可见

如果我们希望图片失效后，显示的是它的描述，



总结来源：[你所不知道的CSS][1]


  [1]: https://www.bilibili.com/video/BV15P4y1C7dL/?spm_id_from=333.999.0.0&vd_source=01fa1eb32f1b06b931cb037876537631