---
title: 封装一个无依赖简易的Jsonp工具库
date: 2024-04-29
category: 前端开发
top: false
tags:
  - Jsonp
description: '最近业务需要和硬件交互，需要客户端发起不同源的请求，但项目中使用Axios封装的请求没有天然的对JSONP进行支持，于是基于对Jquery Ajax中的一些了解，封装一个简单的JsonP请求'
---

# 封装一个无依赖简易的Jsonp工具库

## 核心代码
```typescript
export const Jsonp = <T extends Record<string, any>>(url: string, params: T) => {
	return new Promise((resolve) => {
		const callbackName = "jsonp_callback_" + Math.random().toString(36).slice(2);

		// 添加回调函数到全局作用域
		window[callbackName] = function (data: Record<string, any>) {
			// 移除 script 标签和全局函数
			cleanup();

			// 检查返回的数据是否有效 进行包装
			if (data) {
				resolve(data);
			}
		};

		// 构建带有回调函数的 URL
		const queryString = Object.keys(params)
			.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
			.join("&");

		// 创建 script 标签
		const script = document.createElement("script");
		script.src = queryString ? `${url}?${queryString}&callback=${callbackName}` : `${url}?callback=${callbackName}`;

		// 如果请求失败 直接响应失败状态
		script.onerror = () => {
			cleanup();
			resolve(false);
		};

		// 设置超时
		const timeout = setTimeout(() => {
			cleanup();
			resolve(false);
		}, 10000); // 10 秒后超时

		// 清理函数
		function cleanup() {
			clearTimeout(timeout);
			script.remove();
			delete window[callbackName];
		}

		// 将 script 标签添加到 DOM
		document.body.appendChild(script);
	});
};

```

## 使用
> const res = await Jsonp('url', {string:any})
```typescript
if(!res) // 失败
res => 对应返回数据 //正常逻辑
```

## 后续
把包封装到npm上了，方便以后用到
Npm：[Jsonp][1]
Github：[Jsonp][2]


  [1]: https://github.com/Gu1st/jsonp
  [2]: https://www.npmjs.com/package/@harexs/jsonp