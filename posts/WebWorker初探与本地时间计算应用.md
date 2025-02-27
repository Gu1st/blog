---
title: WebWorker初探与本地时间计算应用
date: 2025-01-10
category: 前端开发
top: false
tags:
  - WebWorker
description: 'Web Workers 是一种在浏览器环境中运行 JavaScript 代码的后台线程机制。它允许你在主线程之外运行脚本，从而实现多线程编程，提高应用的性能和响应性'
---

# WebWorker初探与时间计算应用

## 场景
之前的大屏项目中其中一个时间显示模块需要实时的展示当前时间，并且由于服务端并不提供WS服务

这里采用第一次接口获取时间戳，后续客户端进行计算显示(不采用客户端时间，无法保证客户端时间的有效性)

在一个客户使用场景中出现了需要每一段时间切换浏览器窗口的情况，由于本地时间戳计算是采用定时器`setTimeout`的方式，所以不可避免的出现了在切换窗口回来之后，时间出现了断崖式的差异。
> 当浏览器窗口处于非活动状态时，浏览器会尽可能的节省资源，定时器的执行间隔会被延长或完全不执行，直到浏览窗口重新回到活动状态。


> [!TIP] 
> requestAnimationFrame 也存在此种情况，当然requestAnimationFrame本身是用来做动画更新的
```javascript
    let startTime = null

    function updateTime(){
        requestAnimationFrame(updateTime)

        let currentNow = Date.now()

        if(!startTime){
            startTime = currentNow
        }

        if((currentNow - startTime) >= 1000){
            const currentTimeString = new Date().toLocaleTimeString();
            
            console.log(currentTimeString)
            startTime = currentNow;
        }
    }   
    
    updateTime()
```

## visibilitychange

第一版解决采用了窗口事件监听，我们可以让窗口重新处于活跃状态后再获取一次时间计算即可

```javascript
document.onvisibilitychange = () => {
  if (document.visibilityState === "hidden") {
    clearTimeout(x) // 窗口非活跃状态时 关闭定时器
  }else{
    BeginTime() // 获取接口时间再计算
  }
};
```

## Web Worker

虽然`visibilitychange`重新获取服务器时间解决了时间差异问题，但仍然存在切换窗口回来后，由于响应速度和设备性能导致出现短暂的时间跳动显示。
> 2025 01-10 12:00:00 => 2025 01-10 15:00:00 ， 处于12点时 停顿了1~2秒后再跳到 15点

因此这里继而采用了第二版解决方案： `Web Worker`

### 特性
`Web Workers`可以在后台线程中运行 JavaScript 代码，与主线程（即浏览器的 UI 线程）并行执行。这意味着即使在执行复杂的计算或长时间运行的任务时，也不会阻塞主线程。如果需要处理大量的数据计算或进行密集的图像处理，使用 Web Workers 可以避免页面卡顿

### 独立上下文
`Web Workers`中的上下文不会与主线程共享， 所以存在`WorkerGlobalScope`对象，与主线程的`Window`不同，所以也不能直接访问主线程的 DOM元素、全局变量等。仅通过消息机制通信

### 消息传递
Web Workers 与主线程之间的通信是通过消息传递机制实现并且是异步的，所以不会阻塞主线程

### 生命周期
主线程可以用`worker.terminate()`终止，自身也可以通过`self.close()`终止

## 使用Web Worker进行秒级读取
#### 主线程
```javascript
  if (window.Worker) {
      const worker = new Worker('./work.js');

      // 接收work的消息
      worker.onmessage = function (e) {
          // 更新页面上的时间显示
          console.log('from work',e.data)
          // document.getElementById('time').innerText = e.data;
      };

      // 发送消息给 Web Worker，启动定时器
      worker.postMessage({ type: 'start' });
  } else {
      alert('浏览器不支持 Web Workers');
  }
```

#### Work
```javascript
let startTime = null;

onmessage = function (e) {
    // 更新页面上的时间显示
    if(e.data.type == 'start'){
        updateTime();
    }
};

function updateTime() {
    const currentTime = Date.now();

    if (startTime === null) {
        startTime = currentTime;
    }

    const elapsedTime = currentTime - startTime;

    if (elapsedTime >= 1000) {
        const currentTimeString = new Date().toLocaleTimeString();
        postMessage(currentTimeString); // 发送消息到主线程
        startTime = currentTime;
    }

    setTimeout(updateTime, 1000); // 每1秒更新一次
}
```
