---
title: 实现一个ClickOutSide指令
date: 2024-01-26
category: Vue
top: false
tags:
  - Vue
  - 插件
description: '最近在刷Vue文档，顺便读了下ElementPlus的一点点源码， 记录下这个插件的核心实现'
---

# 实现一个ClickOutSide指令

## 主要思路
1. 指令绑定阶段将绑定的元素和其对应的检测函数和用户传递的函数存储起来，指令更新阶段则取出元素的函数进行对比更新
2. 编写检测函数，主要判断鼠标按下和弹起的元素和绑定指令的元素是否存在子后代关系
3. 每次鼠标按下弹起时(弹起事件回调)，将需要`ClickoutSide`的元素读取出来，并将按下弹起的元素传入到我们进行判断的函数中，如果元素之间不存在子后代和自身关系则触发传递给指令的函数

## 实现
### 1. 指令绑定和更新
```typescript
const nodeList = new Map();

const ClickOutSide: ObjectDirective = {
  beforeMount(el, binding) {
    console.log(el, binding);

    // 如果不在库中存在则存储这个元素用于重复绑定的对比
    if (!nodeList.has(el)) {
      nodeList.set(el, []);
    }

    // 然后把存在的元素取出来 把事件存储
    nodeList.get(el).push({
      handler: createDocumentHandler(el, binding),
      fn: binding.value,
    });
  },
  updated(el, binding) {
    // 如果不在库中存在则存储这个元素用于重复绑定的对比
    if (!nodeList.has(el)) {
      nodeList.set(el, []);
    }
    // 如果存在 则将事件取出来 进行新旧替换
    const handlers: Array<{ handler: Function; fn: Function }> =
      nodeList.get(el)!;
    const oldHanlerIndex = handlers.findIndex(
      (item) => item.fn === binding.oldValue
    );

    const newHandler = {
      handler: createDocumentHandler(el, binding),
      fn: binding.value,
    };

    // 存在就替换 不存在就新增
    if (oldHanlerIndex >= 0) {
      handlers.splice(oldHanlerIndex, 1, newHandler);
    } else {
      handlers.push(newHandler);
    }
  },
  unmounted(el) {
    // 移除元素
    nodeList.delete(el);
  },
};
```

### 2.createDocumentHandler函数
> 这个函数内部会返回一个新函数，函数内部只做一件事情，判断元素和元素之间是否存在子后代关系
```typescript
// 用于创建和元素对应的事件函数 内部主要做的是 判断点击的这个元素在不在 绑定指令的元素的自身和后代中
// 符合条件的就执行函数，不符合的不做任何操作
function createDocumentHandler(el: HTMLElement, binding: DirectiveBinding) {
  //先不考虑特殊情况

  return function (mouseDown: MouseEvent, mouseUp: MouseEvent) {
    // 取到弹起元素和按下元素
    const downTarget = mouseDown.target as Node;
    const upTarget = mouseUp.target as Node;

    // 判断传进来的 是不是 按下和弹起的 血缘节点
    const isContainer = el.contains(downTarget) || el.contains(upTarget);

    // 判断 弹起时的元素 是否就是 自身
    const isSelf = el === upTarget;

    // 是否缺失了目标元素
    const isTargetExists = !downTarget || !upTarget;

    if (isContainer || isSelf || isTargetExists) return;

    // 都不存在以上的条件则执行用户的函数
    isFunction(binding.value) && binding.value(mouseDown, mouseUp);
  };
}
```

### 3. 鼠标弹起时，将所有存储元素取出并传入鼠标事件对象调用函数
```typescript
// 每次点击的时候记录按下的元素， 弹起时用于对比 防止按下然后鼠标移动再弹起不是同一个元素
let StartClick: MouseEvent;

document.addEventListener("mousedown", (e: MouseEvent) => (StartClick = e));
document.addEventListener("mouseup", (e: MouseEvent) => {
  // 每次鼠标弹起时 就将对应按下和弹起的 事件对象 传给使用了这个插件的 
  // 这里的handlers其实是一个二维数组，因为我们能保证每次存储对应的value都是一个数组
  for (const handlers of nodeList.values()) {
    // handler 仍然还是一个对象数组 继续遍历
    for (const { handler } of handlers) {
      // 将按下弹起元素传入 检测元素是否是子节点
      // 如果不是 则会通过闭包的关系拿到bingding.value执行
      handler(e, StartClick);
    }
  }
});
```