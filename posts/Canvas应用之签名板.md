---
title: Canvas应用之签名板
date: 2025-02-20
category: 前端开发
top: false
tags:
  - 签名板
  - Canvas
description: "基于昨天的学习，再拓展下Canvas应用"
---

# Canvas应用之签名板

> [!TIP]
> 实现一个具备重置、撤销能力的签名板

## 前置知识

### 绘制笔画
```typescript
  ctx.fillStyle = '#000';
  ctx.beginPath(); // 开始绘制
  ctx.arc(X, Y, 2, 0, 2 * Math.PI);  // 绘制直径2 的圆点
  ctx.fill(); // 填充实心
  ctx.stroke(); // 渲染
```

### 事件
> [!NOTE]
> 注意在移动端下事件的监听可能有所不同

鼠标按下时注册移动事件，松开时释放事件监听
```typescript
  // 鼠标按下 注册事件
    canvasRef!.value?.addEventListener('mousedown',()=>{
    canvasRef!.value?.addEventListener('mousemove',PaintArc)
  })

    // 鼠标松开 卸载事件
    canvasRef!.value?.addEventListener('mouseup',()=>{
    canvasRef!.value?.removeEventListener('mousemove',PaintArc)
  })
```
### 状态存储
将每次鼠标松开后的状态存储到队列中，一旦用户选择撤销则恢复上一次的状态即可.`canvas`提供了画板的存储和恢复
```typescript
const state= ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height) //将当前画板内容存储
ctx.putImageData(state, 0, 0) // 恢复画板到指定的状态
```

## 实现

```vue
<script setup lang="ts">
import { onMounted,ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement>()
const history = ref<any[]>([]); // 用于存储历史状态


// 绘制圆点
const PaintArc = (e:MouseEvent) => {
  const ctx = canvasRef!.value?.getContext('2d') as CanvasRenderingContext2D 

  const offsetLeft = canvasRef!.value?.offsetLeft as number
  const offsetTop = canvasRef!.value?.offsetTop as number

  //按下坐标 - 起始点 = 实际偏移
  const offsetX = Math.abs(offsetLeft - e.x)
  const offsetY = Math.abs(offsetTop - e.y)

  ctx.fillStyle = '#000';
  ctx.beginPath(); // 开始绘制
  ctx.arc(offsetX, offsetY, 2, 0, 2 * Math.PI);  // 绘制直径2 的圆点
  ctx.fill(); // 填充实心
  ctx.stroke(); // 渲染
}

// 重置画板
const reset = () => {
  const ctx = canvasRef!.value?.getContext('2d') as CanvasRenderingContext2D 

  const width = canvasRef!.value?.width as number
  const height = canvasRef!.value?.height as number

  // 填充画板为白底
  ctx.fillStyle='#fff'
  ctx.fillRect(0,0,width,height)

  history.value = []
}

// 撤销
const cancel = () => {
  const ctx = canvasRef!.value?.getContext('2d') as CanvasRenderingContext2D 

  if(history.value.length > 1){
    history.value.pop(); // 移除最后一个状态
    const lastState = history.value[history.value.length - 1];
    ctx.putImageData(lastState, 0, 0); // 恢复到上一个状态
  }else{
    reset() // 只剩一个状态直接清空
  }
}



onMounted(()=>{
  // 鼠标按下 注册事件
  canvasRef!.value?.addEventListener('mousedown',()=>{
    canvasRef!.value?.addEventListener('mousemove',PaintArc)
  })

  // 鼠标松开 卸载事件
  canvasRef!.value?.addEventListener('mouseup',()=>{
    canvasRef!.value?.removeEventListener('mousemove',PaintArc)

    const ctx = canvasRef!.value?.getContext('2d') as CanvasRenderingContext2D 
    const state = ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height)
    history.value.push(state)
  })
})


</script>

<template>
  <div class="wrap" >
     <canvas ref="canvasRef" width="800" height="500" style="background-color:#fff" />
     <div>
        <button @click="cancel">撤销</button>
        <button @click="reset">重置</button>
     </div>
  </div>
  
</template>

<style scoped>
.wrap{
  display:flex;
  flex-direction:column;
  gap:10px;
  justify-content:center;
  align-items:center;
  height:100%;
  width:100%;
  background-color:#ddd;
}
</style>
```