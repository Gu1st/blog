---
title: Electron实践手记
date: 2024-12-11
category: Electron
top: false
tags:
  - Electron
description: '更加全面的认识Electron开发'
---

# Electron实践手记

## 预加载脚本
预加载脚本与浏览器共享同一个全局 Window 接口，并且可以访问 Node.js API

webPreferences.contextIsolation = true 默认开启上下文隔离，渲染进程无法直接访问 Node.js

通过预加载脚本将操作通过 contextBridge 模块封装成 API 提供给渲染进程
```ts
// 先于网页内容加载的脚本
// 该文件被强制要求使用 cjs 规范
const fs = require('fs')
const { contextBridge } = require('electron')  

// console.log(window.myAPI)  渲染进程访问
contextBridge.exposeInMainWorld('myAPI', {  
    exists: fs.existsSync
})
```

## 进程通信
### 渲染进程
#### ipcRenderer.send
> 异步,发送消息后不会等待主进程的响应，而是立即返回，适合在不需要等待主进程响应的情况下发送消息
渲染进程向主进程发送消息
```js
import { ipcRenderer } from 'electron';

// 主动发送
ipcRenderer.send('my_channel', 'my_data');
```
主进程监听渲染进程
```js
import { ipcMain } from 'electron';

ipcMain.on('my_channel', (event, message) => {
  console.log(`receive message from render: ${message}`)
  // 如果是通过send发送消息给主进程，如果主进程回复则需要使用 reply
  event.reply('reply', 'main_data')  
})
```
渲染进程监听主进程发送的消息
```js
ipcRenderer.on('reply', (event, message) => { 
  console.log('replyMessage', message);
})
```
#### ipcRenderer.invoke
> 异步,invoke的返回值是一个Promise，在渲染进程中等待主进程返回 Promise 结果


渲染进程向主进程发送消息,并且返回结果通过Promise取得，无需额外监听
```js
import { ipcRenderer } from 'electron';

// 主动发送
async function invokeMessageToMain() {
  const replyMessage = await ipcRenderer.invoke('my_channel', 'my_data');
  console.log('replyMessage', replyMessage);
}
```
主进程监听渲染进程，
```js
import { ipcMain } from 'electron';
// invoke来的消息通过handle监听，通过return返回
ipcMain.handle('my_channel', async (event, message) => {
  console.log(`receive message from render: ${message}`);
  return 'replay'; // 通过return返回结果
});
```
#### ipcRender.sendSync
> 异步方法，但会等待主进程的返回响应并阻塞当前进程，直到收到主进程的返回值或者超时。作为不得已的通信手段
发送消息
```js
import { ipcRenderer } from 'electron';

async function sendSyncMessageToMain() {
  const replyMessage = await ipcRenderer.sendSync('my_channel', 'my_data');
  console.log('replyMessage', replyMessage);
}
```
主进程响应消息
```js
import { ipcMain } from 'electron';
ipcMain.on('my_channel', async (event, message) => {
  console.log(`receive message from render: ${message}`);
  event.returnValue = 'replay'; // 如果不进行returnValue会导致阻塞
});
```

### 主进程
#### ipcMain
通过监听到的消息回调中，event.sender 会指向发送消息的窗口对象
```js
import { ipcMain } from 'electron';

ipcMain.on('messageFromMain', (event, arg) => {
  event.sender.send('messageToRenderer', 'Hello from Main!');
});
```

#### BrowserWindow
通过实例对象，也可以主动进行消息的发送， event.sender和webContents指向类型是同一个
```js
import { BrowserWindow } from 'electron';

const mainWindow = new BrowserWindow();
mainWindow.loadFile('index.html');

// 在某个事件或条件下发送消息
mainWindow.webContents.send('messageToRenderer', 'Hello from Main!');
```

### 渲染进程互相通信
#### 中间人
和Web开发中的跨层级组件通信原理一致，子窗口发送消息到父窗口，父窗口监听到后，将信息再发送到另外一个子窗口，这个子窗口再监听父窗口的消息，不作展开。


#### MessagePort
MessagePort是基于MDN的WEB标准，Electron提供了基于Node的实现，所以主进程下也可以使用它
1. 创建通道
```js
import { BrowserWindow, app, MessageChannelMain } from 'electron';

app.whenReady().then(async () => {
  // 创建窗口
  const mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: false,
      preload: 'preloadMain.js'
    }
  })

  const secondaryWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: false,
      preload: 'preloadSecondary.js'
    }
  })

  // 建立通道
  const { port1, port2 } = new MessageChannelMain()

  // webContents准备就绪后，使用postMessage向每个webContents发送一个端口。
  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.postMessage('port', null, [port1])
  })
  secondaryWindow.once('ready-to-show', () => {
    secondaryWindow.webContents.postMessage('port', null, [port2])
  })
})
```
2. 消息收发
此时主进程就可以使用两个实例化的端口进行互相消息发送和接收
```js
// 主进程
port1.onmessage = (event) => {
  console.log('received result:', event.data)
};
port1.postMessage('我是渲染进程一发送的消息');

// secondaryWindow
port2.onmessage = (event) => {
  console.log('received result:', event.data)
};
port2.postMessage('我是渲染进程二发送的消息');
```

3. 注册端口和挂载
但更多是在渲染进程中进行互相通信，我们需要绕开主进程调用这一层，将端口挂载注册到全局中
```js
// 所有渲染进程中
const { ipcRenderer } = require('electron')

ipcRenderer.on('port', e => {
  // 接收到端口，使其全局可用。
  window.electronMessagePort = e.ports[0]
  window.electronMessagePort.onmessage = messageEvent => {
    // 处理消息
    console.log('received result1:', event.data)
  }
  window.electronMessagePort.postMessage('我是渲染进程X发送的消息')
})
```

## 菜单
### 应用菜单
[官方文档](https://www.electronjs.org/zh/docs/latest/api/menu-item)

需要注意，MacOS中，此菜单是显示在桌面左上角，而Window是窗口顶部
```js
import { Menu } from 'electron'

function createMenu () {
  const template = [
    {
      label: '菜单一',
      submenu: [
        {
          label: '功能一'
        },
        {
          label: '功能二'
        }
      ]
    },
    {
      label: '菜单二',
      submenu: [
        {
          label: '功能一'
        },
        {
          label: '功能二'
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
```
> [!TIP]
> 在macOS中,默认第一个菜单的标签总是应用标题不支持修改，所以需要单独处理或者使用官方提供的修改Info.plist方案

```js
// 增加一个标题菜单
if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {
        label: 'Quit',
        click() {
          app.quit();
        }
      }
    ]
  });
}
```

### 上下文菜单
此类操作由渲染进程触发后交给主进程来绘制，当然也可以由渲染进程绘制再通信
> 其配置文档与应用菜单一致
```js
// 渲染进程 renderer/main.js
window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    ipcRenderer.send("show-context-menu");
});
    
ipcRenderer.on("context-menu-command", (e, command) => {
    console.log(e,command)
});


// 主进程 main/index.js
ipcMain.on('show-context-menu', (event) => {
    const template = [
        {
            label: '菜单一',
            click: () => {
                // 发送点击菜单一事件到渲染进程
                event.sender.send('context-menu-command', 'menu-item-1')
            }
        },
        { type: 'separator' },
        {
            label: '菜单二',
            type: 'checkbox',
            checked: true
        }
    ]
    const menu = Menu.buildFromTemplate(template)
    menu.popup({
        window: BrowserWindow.fromWebContents(event.sender)
    })
})
```

### Dock菜单
此为macOS独有，使用不同的API设置
```js
const createDockMenu = () => {
  const dockTempalte = [
    {
      label: '菜单一',
      click () {
        console.log('New Window');
      }
    }, {
      label: '菜单二',
      submenu: [
        { label: 'Basic' },
        { label: 'Pro' }
      ]
    },
    {
      label: '其他...'
    }
  ];

  const dockMenu = Menu.buildFromTemplate(dockTempalte);
  app.dock.setMenu(dockMenu);
}
```

## 托盘
### 处理托盘的差异情况
在window上使用icon最佳， 苹果设备上需要使用图片模板，且为了保证不模糊需使用32*32的图片，且以Template结尾的文件名
```js
//  Rubick 的源码实现
const commonConst = {
  macOS(){
    return process.platform === 'darwin'
  },
  windows(){
    return process.platform === 'win32'
  }
}
 let icon;
    if (commonConst.macOS()) {
      icon = './icons/iconTemplate@2x.png';  // @2x表示是高分辨率图片 即32*32, 默认16*16
    } else if (commonConst.windows()) {
      icon =
        parseInt(os.release()) < 10
          ? './icons/icon@2x.png'
          : './icons/icon.ico';
    } else {
      icon = './icons/icon@2x.png';
    }
    const appIcon = new Tray(path.join(__static, icon));
```
### 注册托盘
```js
let tray = new Tray('public/icon.ico');
  const contextMenu = Menu.buildFromTemplate([
      {
        label: '退出',
        click: function(){
          app.quit();
        }
      }
    ]);
    tray.setToolTip('Harexs');
  tray.setContextMenu(contextMenu);
```
