---
title: 这是一个新的测试文章
date: 2024-05-01
category: 电影系列
top: false
tags:
  - 动作
  - 冒险
description: '测试文章1'
---
> [!NOTE]
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Crucial information necessary for users to succeed.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.



::: info
[这是一个链接](https://doc.theojs.cn/)
:::

::: tip
[这是一个链接](https://doc.theojs.cn/)
:::

::: warning
[这是一个链接](https://doc.theojs.cn/)
:::

::: danger
[这是一个链接](https://doc.theojs.cn/)
:::

::: details
[这是一个链接](https://doc.theojs.cn/)
:::


::: details Click me to view the code

```js
console.log('Hello, VitePress!')
```

:::



<Box
  :items="[
    //使用FontAwesome图标 + 颜色
    { name: 'Vue.js', link: '', icon: 'fab fa-vuejs', color: '#4FC08D' },
    //使用FontAwesome图标 + 标签
    { name: 'GitHub', link: '', icon: 'fab fa-github', tag: 'Github' },
    //使用FontAwesome图标 + 标签 + 颜色
    {
      name: '支付宝',
      link: 'https://i.theojs.cn/docs/202405201752089.jpg',
      icon: 'fab fa-alipay',
      color: '#00a1e9',
      tag: '打赏'
    },
    {
      name: '微信',
      link: 'https://i.theojs.cn/docs/202405201752087.jpg',
      icon: 'fab fa-weixin',
      color: '#2ca83c',
      tag: '打赏'
    },
    //使用自定义图标 + 标签
    { name: 'GitHub', link: '', icon: 'https://i.theojs.cn/logo/github.svg', tag: 'Github' },
    //使用自定义图标 + 深浅模式 + 标签
    {
      name: 'GitHub',
      link: '',
      light: 'https://i.theojs.cn/logo/github.svg',
      dark: 'https://i.theojs.cn/logo/github-dark.svg',
      tag: 'Github'
    }
  ]"
/>



<Links
  :items="[
    //使用FontAwesome图标 + 颜色
    { name: '支付宝', link: 'https://www.alipay.com', icon: 'fab fa-alipay', color: '#00a1e9' },
    { name: '微信支付', link: 'https://pay.weixin.qq.com', icon: 'fab fa-weixin', color: '#2ca83c' },
    //使用自定义图标
    { name: '支付宝', link: 'https://www.alipay.com', icon: 'https://i.theojs.cn/logo/github.svg' },
    //使用自定义图标 + 深浅模式
    {
      name: '支付宝',
      link: 'https://www.alipay.com',
      light: 'https://i.theojs.cn/logo/github.svg',
      dark: 'https://i.theojs.cn/logo/github-dark.svg'
    },
    //不使用图标
    { name: '支付宝', link: 'https://www.alipay.com' }
  ]"
/>



<BoxCube
  :items="[
    //使用FontAwesome图标
    { name: 'Github', link: '', icon: 'fab fa-github' },
    //使用FontAwesome图标 + 副标题
    { name: 'Vue.js', link: '', icon: 'fab fa-vuejs', desc: 'v3.4.31' },
    //使用自定义图标+副标题
    { name: 'Node.js', link: '', icon: 'https://i.theojs.cn/logo/nodejs.svg', desc: 'v20.15.0' },
    //使用自定义图标+深浅模式+副标题
    {
      name: 'Github',
      link: '',
      light: 'https://i.theojs.cn/logo/github.svg',
      dark: 'https://i.theojs.cn/logo/github-dark.svg',
      desc: 'v20.15.0'
    }
  ]"
/>
