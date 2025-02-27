---
title: 初探Canvas之验证码组件实现
date: 2025-02-19
category: 前端开发
top: false
tags:
  - 验证码
  - Canvas
description: "某个简单的业务场景下需要前端来做验证码检验，顺带学习一下Canvas"
---

# 初探 Canvas 之验证码组件实现

> [!TIP]
> 某个简单的业务场景下需要前端来做验证码的检验，顺带学习一下 Canvas

## 前置知识

### 获取 Canvas 对象

```typescript
const ctx = canvasRef.value?.getContext("2d") as CanvasRenderingContext2D;
```

### 绘制形状与线体

```typescript
// 绘制矩形
ctx.fillRect(0, 0, 120, 40);

// 渲染线条
ctx.moveTo(startX, startY);
ctx.lineTo(endX, endY); // 画一条线到 (150, 100) 处
ctx.stroke();

// 绘制圆点
ctx.arc(X, Y, 1, 0, 2 * Math.PI);
```

### 核心思路

1. 取随机数并依次循环绘制(当然也可以增加字母)
2. 根据`Canvas`元素自身容器随机绘制五条干扰线作为干扰元素循环绘制
3. 根据`Canvas`元素自身容器随机绘制五十个圆点作为干扰元素循环绘制

> [!NOTE]
> 注意区分绘制形状线条和图形的 API 区别

## 实现

### 工具函数

```typescript
// 获取随机范围
const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

// 获取随机色 180-230 偏白色底色
const randomColor = (min: number, max: number) => {
  const r = randomNumber(min, max);
  const g = randomNumber(min, max);
  const b = randomNumber(min, max);

  return `rgb(${r},${g},${b})`;
};
```

### 绘制背景

```typescript
// 获取对象
const ctx = canvasRef.value?.getContext("2d") as CanvasRenderingContext2D;
// 填充背景
ctx.fillStyle = randomColor(180, 230);
// 绘制矩形
ctx.fillRect(0, 0, 120, 40);
```

### 绘制数字

```typescript
// 取出4个随机数字
for (let i = 0; i < 4; i++) {
  // 取对应数字
  const text = NUMBER_STRING[randomNumber(0, NUMBER_STRING.length - 1)];
  code.value += text;

  // 取文本字体样式
  ctx.font = "20px Arial";
  // 取文字颜色
  ctx.fillStyle = randomColor(80, 150);
  // 保存状态
  ctx.save();
  // 取文本偏移位置 每次循环增加偏移
  ctx.translate(30 * i + 15, 20);
  // 取文本旋转角度
  ctx.rotate((i * Math.PI) / 180);
  // 取文本填充位置
  ctx.fillText(text, 0, 0);
  // 绘制文本然后返回状态
  ctx.restore();
}
```

### 绘制干扰线

```typescript
// 取出10条干扰线
for (let i = 0; i < 5; i++) {
  // 随机颜色线条
  ctx.strokeStyle = randomColor(50, 200);
  ctx.beginPath();

  // 根据canvas元素 随机绘制长度的干扰直线
  const startX = randomNumber(0, canvasRef.value!.width);
  const startY = randomNumber(0, canvasRef.value!.height);
  const endX = randomNumber(0, canvasRef.value!.width);
  const endY = randomNumber(0, canvasRef.value!.height);

  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY); // 画一条线到 (150, 100) 处
  ctx.stroke(); // 渲染线条
}
```

### 绘制干扰圆点

```typescript
// 取出50个干扰点
for (let i = 0; i < 51; i++) {
  // 随机颜色点
  ctx.strokeStyle = randomColor(50, 200);
  ctx.beginPath();

  // 取随机位置
  const X = randomNumber(0, canvasRef.value!.width);
  const Y = randomNumber(0, canvasRef.value!.height);

  // 绘制圆点
  ctx.arc(X, Y, 1, 0, 2 * Math.PI);

  ctx.stroke(); // 渲染
}
```

## 封装

最后其封装为一个通用组件,并增加刷新验证码的能力

```vue
<template>
  <canvas ref="canvasRef" @click="refeshCode" width="120" height="40" />
</template>
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    width?: number;
    height?: number;
  }>(),
  {
    width: 120,
    height: 40,
  }
);

const canvasRef = ref<HTMLCanvasElement>();
const code = ref("");

// 获取随机范围
const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

// 获取随机色 180-230 偏白色底色
const randomColor = (min: number, max: number) => {
  const r = randomNumber(min, max);
  const g = randomNumber(min, max);
  const b = randomNumber(min, max);

  return `rgb(${r},${g},${b})`;
};

const NUMBER_STRING = `0123456789`;

// 刷新验证码
const refeshCode = () => {
  code.value = ""; // 清空验证码
  draw(canvasRef.value, props.width, props.height);
};

// 绘制函数
const draw = (canvasRef: HTMLCanvasElement | undefined, width: number, height: number) => {
  const ctx = canvasRef?.getContext("2d") as CanvasRenderingContext2D;

  // 填充背景
  ctx.fillStyle = randomColor(180, 230);
  // 绘制矩形
  ctx.fillRect(0, 0, width, height);

  // 取出4个随机数字
  for (let i = 0; i < 4; i++) {
    // 取对应数字
    const text = NUMBER_STRING[randomNumber(0, NUMBER_STRING.length - 1)];
    code.value += text;

    // 取文本字体样式 字体大小根据高度 /2
    const fontSize = height / 2;
    ctx.font = `${fontSize}px Arial`;

    // 取文字颜色
    ctx.fillStyle = randomColor(80, 150);
    // 保存状态
    ctx.save();
    // 取文本偏移位置 每次循环增加偏移  固定四个字 那么取宽度 除于当前位数
    const translateOffsetWidth = width / 4;
    ctx.translate(translateOffsetWidth * i + 15, fontSize);
    // 取文本旋转角度
    ctx.rotate((i * Math.PI) / 180);
    // 取文本填充位置
    ctx.fillText(text, 0, 0);
    // 绘制文本然后返回状态
    ctx.restore();
  }

  // 取出10条干扰线
  for (let i = 0; i < 5; i++) {
    // 随机颜色线条
    ctx.strokeStyle = randomColor(50, 200);
    ctx.beginPath();

    // 根据canvas元素 随机绘制长度的干扰直线
    const startX = randomNumber(0, width);
    const startY = randomNumber(0, height);
    const endX = randomNumber(0, width);
    const endY = randomNumber(0, height);

    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY); // 画一条线到 (150, 100) 处
    ctx.stroke(); // 渲染线条
  }

  // 取出50个干扰点
  for (let i = 0; i < 51; i++) {
    // 随机颜色点
    ctx.strokeStyle = randomColor(50, 200);
    ctx.beginPath();

    // 取随机位置
    const X = randomNumber(0, width);
    const Y = randomNumber(0, height);

    // 绘制圆点
    ctx.arc(X, Y, 1, 0, 2 * Math.PI);

    ctx.stroke(); // 渲染
  }
};

onMounted(() => {
  // 默认绘制一次 渲染传递的宽高
  canvasRef.value!.width = props.width;
  canvasRef.value!.height = props.height;
  refeshCode();
});

const getImgCode = () => {
  return code.value;
};

defineExpose({
  getImgCode,
});
</script>
```

### 调用

```vue
<template>
  <div>By Harexs</div>
  <VerifyCode ref="VerifyCodeRef" :width="200" :height="50" />
  <button @click="getImgCode">获取验证码</button>
</template>

<script setup lang="ts">
const VerifyCodeRef = ref();

const getImgCode = () => {
  console.log(VerifyCodeRef.value.getImgCode());
};
</script>
```
