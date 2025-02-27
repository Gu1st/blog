---
title: 解读DataV中的全屏容器组件,学习全屏组件实现
date: 2023-11-22
category: 前端开发
top: false
tags:
  - 组件原理
  - DataV
description: '最近在开发和电视机大屏看板相关的一些需求，主要是使用Echarts和DataV,对于全屏容器组件是怎么实现对于页面的缩放和调整，到源码去阅读了一番'
---

# 解读DataV中的全屏容器组件

## 使用
[DataV Github](https://github.com/DataV-Team/DataV)

[官方文档](http://datav.jiaminghi.com/)
```HTML
<dv-full-screen-container>
    内容
</dv-full-screen-container>
```

## 入口
`DataV\src\components\fullScreenContainer\src`

组件本身不到70行代码，这里还涉及到Vue中的 混入知识
`mixins: [autoResize]`
它是这个文件`DataV\src\mixin\autoResize.js`

> mixins 主要是为了将一些通用 方法对象抽象出来后，通过混入的形式让每个组件很方便的复用， 在Vue3后则有了Composition Api（组合式函数）出现后 成为了更好的选择
> https://cn.vuejs.org/api/options-composition.html#mixins

### autoResize
```js
mounted () {
    const { autoResizeMixinInit } = this

    autoResizeMixinInit()
  }
```
```js
async autoResizeMixinInit () {
      const { initWH, getDebounceInitWHFun, bindDomResizeCallback, afterAutoResizeMixinInit } = this

      await initWH(false)

      getDebounceInitWHFun()

      bindDomResizeCallback()

      if (typeof afterAutoResizeMixinInit === 'function') afterAutoResizeMixinInit()
    }
```
> 可以在这一期的源码共读中去理解为什么能从 this中解构 method data https://juejin.cn/post/7130459967772950535

被混入后执行`mounted`生命周期,它会在this中解构`autoResizeMixinInit`函数执行,接下来我们来看这个函数的内部首先`await 的 initWH函数`

### initWH
```js
initWH (resize = true) {
//  注意这里的ref 和 onResize在自身没找到就会在组件中寻找，组件是存在这个变量和方法的
      const { $nextTick, $refs, ref, onResize } = this
    
      return new Promise(resolve => {
        $nextTick(_ => {
          const dom = this.dom = $refs[ref]

          this.width = dom ? dom.clientWidth : 0
          this.height = dom ? dom.clientHeight : 0

          if (!dom) {
            console.warn('DataV: Failed to get dom node, component rendering may be abnormal!')
          } else if (!this.width || !this.height) {
            console.warn('DataV: Component width or height is 0px, rendering abnormality may occur!')
          }

          if (typeof onResize === 'function' && resize) onResize()

          resolve()
        })
      })
    }
```
这里在Promise内部执行了Dom的获取和宽高变量的定义，并且在Dom获取失败后 弹出控制台的警告. 最后会执行一次`onResize` 这个函数

需要注意 首次调用`initWh(false)`函数时我们传递了false进来，所以onResize一开始不会被执行,另外需要注意这个函数是在我们组件本身内部定义的

### getDebounceInitWHFun
```js
getDebounceInitWHFun () {
  const { initWH } = this

  this.debounceInitWHFun = debounce(100, initWH)
}
```
这里通过防抖函数包装了`debounceInitWHFun`函数并挂载在this上，主要是为了防止后续`resize`窗口变化过于频繁

### bindDomResizeCallback
```js
bindDomResizeCallback () {
  const { dom, debounceInitWHFun } = this

  this.domObserver = observerDomResize(dom, debounceInitWHFun)

  window.addEventListener('resize', debounceInitWHFun)
}
```
将前面封装的 `debounceInitWHFun` 函数和`Dom`取出, 并注册了 `resize`事件， 以及`MutationObserver`监听, `observerDomResize` 函数是对于MutationObserver的封装，本质是调用了`MutationObserver`, 并且单独监听 元素的 `style`属性变化
> https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
```js
export function observerDomResize (dom, callback) {
  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver

  const observer = new MutationObserver(callback)

  observer.observe(dom, { attributes: true, attributeFilter: ['style'], attributeOldValue: true })

  return observer
}
```

这一步后所做的操作就是如果页面宽高发生了变化，或者 组件本身的`style`属性发生了改变,就会去触发`initWh`这个函数

### afterAutoResizeMixinInit
`autoResizeMixinInit` 函数内部就走到最后一行 去判断组件内部是否有`afterAutoResizeMixinInit`函数可以执行
```js
afterAutoResizeMixinInit () {
      const { initConfig, setAppScale } = this

      initConfig()

      setAppScale()

      this.ready = true
    }
```
### initConfig
```js
initConfig () {
      const { dom } = this
      const { width, height } = screen

      this.allWidth = width

      dom.style.width = `${width}px`
      dom.style.height = `${height}px`
    }
```
`initConfig`函数 从 `window.screen` 得到屏幕宽高，并将组件的宽高设置为对应宽高。到这里根据之前注册的 `MutationObserver`监听,会去执行`initWH` 函数，并且内部根据默认参数会去执行 组件内的 `onResize`函数,最终去调用的 实际是 `setAppScale` 函数

### setAppScale
```js
// const { setAppScale } = this
// setAppScale()

setAppScale () {
  const { allWidth, dom } = this

  const currentWidth = document.body.clientWidth

  dom.style.transform = `scale(${currentWidth / allWidth})`
}
```

至此就理解了全屏容器的实现本质，通过监听页面的变化以及组件自身的宽高变化， 通过`当前页面Body元素宽度 / 屏幕视口宽度`的 比例 设置组件本身的缩放`transform:scale`

## 流程梳理
1. `initWH`函数对组件进行初始化
2.  `getDebounceInitWHFun`函数得到防抖的 `initWh`函数 
3.  `bindDomResizeCallback`函数监听页面和组件的变化触发 `initWh`函数 
4.  组件内的`afterAutoResizeMixinInit`函数会获取页面的宽高和设置组件的宽高 
5.  `setAppScale` 则通过计算得到组件的缩放比例 最后再 插槽内容进行显示`this.ready = true`

### 注意点
如果您在 父组件中 `Mounted`生命周期去获取全屏容器中的DOM元素 或者 初始化 Echarts之类的操作，会出现获取的` Dom 为 null`的情况！

虽然父子组件的`Mounted` 生命周期顺序是子组件先行，但因为全屏容器组件中的`slot`插槽 使用了`v-if` 的判断，一开始结果就是`ready:false`， 那么父组件`Mounted`执行的时候，实际全屏容器内的所有DOM都是不存在的， 等执行 `this.ready = true`时，全屏容器内的插槽又重新加载了一次， 所以 在父组件的`Mounted` 去获取 全屏容器内的内容时还需要使用 `nextTick`函数

> 当你在 Vue 中更改响应式状态时，最终的 DOM 更新并不是同步生效的，而是由 Vue 将它们缓存在一个队列中，直到下一个“tick”才一起执行。这样是为了确保每个组件无论发生多少状态改变，都仅执行一次更新。

## 组件实现
接下来实现一个Vue3版本的 全屏容器组件,核心的就是对于组件和页面变化监听 重新设置组件的缩放比例
### 防抖
```ts
export const debounce = (fn: Function, wait: number, invoke?: boolean) => {
	let timer: any = null;
	let isInvoke = invoke;
	return function (this: unknown, ...args: any[]) {
		if (isInvoke && !timer) {
			fn.apply(this, args);
			isInvoke = false;
		}
		if (timer) setTimeout(timer);
		timer = setTimeout(() => {
			fn.apply(this, args);
		}, wait);
	};
};
```
### 全屏组件
```html
<template>
	<div class="Screen" ref="BigScreen">
		<template v-if="ready">
			<slot></slot>
		</template>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { debounce } from "../utils/Debounce";

let BigScreen = ref(); //容器组件
let ready = ref(false);
let width = ref(0);
let height = ref(0);
let domObserver: any;

onMounted(() => {
    // 初始化
    initApp();
    // 设置缩放
    setScale();
    // 基于窗口变化缩放
    window.addEventListener("resize", debounceInScale);
    // 基于自身大小变化缩放
    domObserver = new MutationObserver(debounceInScale)；
    domObserver.observe(BigScreen.value, {
            attributes: true,
            attributeFilter: ["style"],
            attributeOldValue: true,
    });
    //渲染内容
    ready.value = true;
});

onUnmounted(() => {
	window.removeEventListener("resize", debounceInScale);
	if (!domObserver) return;
	domObserver.disconnect();
	domObserver.takeRecords();
	domObserver = null;
});

const setScale = () => {
	BigScreen.value.style.transform = `scale(${
		document.body.clientWidth / width.value
	})`; //按宽度等比例按照缩放倍率进行缩放
};

const debounceInScale = debounce(setScale, 1000);

const initApp = () => {
	width.value = screen.width;
	height.value = screen.height;

	BigScreen.value.style.width = `${width.value}px`;
	BigScreen.value.style.height = `${height.value}px`;
};
</script>

<style scoped>
.Screen {
	position: fixed;
	top: 0px;
	left: 0px;
	overflow: hidden;
	transform-origin: left top;
	transition: transform 0.2s;
	z-index: 999;
}
</style>

```
### 使用
```html
<template>
    <BigScreen>
         <div ref="child"></div>
    </BigScreen>
</template>
<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import BigScreen from "./components/BigScreen.vue";

let child = ref(null);
onMounted(() => {
	nextTick(() => {
		console.log(child);
	});
});
</script>
```