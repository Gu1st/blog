---
title: JS原生根据文本生成语音播报
date: 2024-10-08
category: 前端开发
top: false
tags:
  - 语音合成
description: '在不依赖第三方服务的情况下，实现诸如数据看板、实时轮播数据、划词之类的语音播报'
---

# JS原生根据文本生成语音播报

## 前提

最近一个需求需要根据一些字段拼接组合成文本并实时通过语音播放，而且需要前端实现，在不依靠第三方服务的情况下，调研到 [Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) 可以支持文本语音合成。

## SpeechSynthesis

> 该对象作为Window下的静态成员无需实例化，主要用于语音播放、暂停、语音切换

### 属性

#### paused

布尔值，当前是否处于暂停播放状态

#### pending

布尔值，当前是否还有未播放的语音

#### speaking

布尔值，当前是否正在播放语音

### 方法

#### cancel

无参，从当前还未播放的语音全部移除

#### getVoices

无参，返回[SpeechSynthesisVoice](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice)对象列表，用于SpeechSynthesisUtterance语音合成对象切换内置的预设声音对象

#### pause

无参，暂停播放

#### resume

无参，暂停或者播放，根据当前状态取反

#### speak

参数为SpeechSynthesisUtterance实例对象， 核心方法，用于播放语音

## SpeechSynthesisUtterance

> 该对象是语音合成对象，也是文本合成语音的主要API

### 实例属性

#### lang

播放语音时语言选择，默认按照 html标签的lang属性，中文设置为 zh-CN

#### pitch

数值，控制语调，

#### rate

数值，控制语速，0-10

#### text

要播放的文本

#### voice

要播放的声音对象，取值于之前提到的getVoices方法的返回对象列表

## 使用参考

### 播放一个声音

```javascript
if ('speechSynthesis' in window) {
  // 文本转语音
  const synth = window.speechSynthesis
  const text = '你好，这是一个测试。';
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN'; // 设置语言

  // 播放音频
  synth.speak(utterance);
} else {
  console.log('浏览器不支持 Web Speech API');
}
```

### 切换声音类型

```javascript

if ('speechSynthesis' in window) {
  const synth = window.speechSynthesis
  // 获取所有语音声音类型，包含英语 粤语...
  const voices = synth.getVoices(); // 请根据需要自定展开对象列表查看对象描述
  // 文本转语音
  const text = '你好，这是一个测试。';
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN'; // 设置语言
  utterance.voice = voices[0] // 使用中文 

  // 播放音频
  synth.speak(utterance);
} else {
  console.log('浏览器不支持 Web Speech API');
}
```
