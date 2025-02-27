---
title: Vite打包优化小记
date: 2024-12-31
category: 前端开发
top: false
tags:
  - Vite
  - 性能优化
description: '实践出真知'
---


# Vite打包优化小记

## 增加打包产物分析

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({mode})=>({
  plugins: [  // 如果是 xxx run build --mode visualizer 则增加产物分析插件, 构建成功后项目根目录会创建visualizer.html文件
    mode == "visualizer" ? visualizer({
    open: true, // 如果存在本地服务端口，将在打包后自动展示
    filename: 'visualizer.html' // 分析图生成的文件名
  }): undefined],
}))

```

## 语法降级和白屏兼容
移动端下或者比较老的运行环境中，可能不支持ES Module，通过官方插件增加支持。
打包后的产物会生成nomodule标识的js引用，兼容非现代浏览器
> 降级会额外产生leagcy模式的产物，比正常打包的模块要大一些


```typescript
import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // 省略其它插件
    legacy({
      // 设置目标浏览器，browserslist 配置语法
      //这个配置会透传到 babel/preset-env
      targets: ['ie >= 11'],
    })
  ]
})
```


## Echarts优化/单独分包
查看入口文件`index.js` 发现，其中包含了Echarts的全部代码，通过按需引入将其分离。 

这里很重要的一点就是组件内使用的时候需要以按需引入的方式来使用，否则在组件内全量引入会增加这个组件chunk的size

> [!NOTE]
> 注意，如果要单独分包，就一定要和Echarts一样，采用按需引入的方式,通过按需引入来降低这个依赖的使用大小, 否则只是拆分了一个很大的js包出来，然后还是引入了这个包，只是降低了入库文件加载的压力并没有用

```typescript
// @/utils/echarts.ts
// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from "echarts/core";
// 引入柱状图图表，图表后缀都为 Chart
import { BarChart, PieChart, LineChart,GaugeChart } from "echarts/charts";
// 引入提示框，标题，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import { TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent, LegendComponent } from "echarts/components";
// 标签自动布局、全局过渡动画等特性
import { LabelLayout, UniversalTransition } from "echarts/features";
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from "echarts/renderers";

// 根据需要使用组件，这里是引入了涵盖了全部的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  BarChart,
  GaugeChart,
  PieChart,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

// 接下来的使用就跟之前一样，初始化图表，设置配置项
export default echarts;
```
> 将echarts、DataV单独作为一个包拆分
```typescript
build:{
    rollupOptions:{
      output:{
        manualChunks:{
          echarts:['echarts'],
          DataV3:['@kjgl77/datav-vue3'],  // 注意，如果要单独分包，就一定要和Echarts一样，采用按需引入的方式 来降低包的引入大小， 否则 单独分js没意义
          ElementPlus:['element-plus']  // 注意，如果要单独分包，就一定要和Echarts一样，采用按需引入的方式 来降低包的引入大小， 否则 单独分js没意义
        }
      }
    }
  }
```

## 组件库按需引入()
通过手动按需引入组件库的方式，可以减少最终需要打包的体积
```typescript
import ElementPlus from 'element-plus'

app.use(router).use(ElementPlus)

// 改为
import { Input,Button, Layout,Table,Pagination,Card,Popover,Tooltip,Textarea,message,Select } from 'element-plus'; //根据需求写入，最终这个配置可以作为文件写出
 // app.use(Input).use(Button)  
```

## unplugin自动导入ElementPlus
根据官方文档指引，将全量使用的ElementPlus改为自动导入(按需导入)，再观测实际后的数据
> 项目会自动产生 auto-imports.d.ts和componets.d.ts文件用于解决类型问题，这里将其放入git忽略

> npm install -D unplugin-vue-components unplugin-auto-import
```typescript
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  // ...
  plugins: [
    // ...
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

## DataV 单独引入拆分
再将DataV进行按需引入拆分优化
```typescript
import {Charts as DvCharts,FullScreenContainer as DvFullScreenContainer,ScrollBoard as DvScrollBoard} from '@kjgl77/datav-vue3'
```

## 拆分结果
> [!TIP]
> 优化前非大屏页: index.js(1.8M) +  组件页面和其他琐碎的文件(0.01M)  => 1.801M<br/>
> 优化前大屏页面: index.js(1.8M) + Echart.js核心依赖(0.3M) + 组件页面和其他琐碎的文件(0.03M)  => 2.103M

> [!TIP]
> 优化后非大屏页 ： index.js(0.4M) + Elementplus按需组件(0.03M) => 0.43M【加载优化~78%】<br/>
> 优化后大屏页面 : index.js(0.4M) + DataV组件引入(0.15M) Echart.js核心依赖(0.3M) + Echart.js组件引入(0.4M) + Elementplus按需组件(0.06M)+ 组件页面和其他琐碎的文件(0.03M) => 1.34M【加载优化~38%】

## 懒加载优化
后续还可以通过懒加载形式，将窗口组件的加载变为懒加载模式，项目中用到并不多且大多都是小组件，这里不进行计算
```typescript
import { defineAsyncComponent } from 'vue'

//（即该异步组件在页面中被渲染时）
const Foo = defineAsyncComponent(() => import('./Foo.vue'))
```

## 输出产物分类
Vite默认会将产物输出到assets中，这里我们通过rollup配置进行分类
```typescript
 build:{
    rollupOptions:{
      output:{
        entryFileNames:'assets/js/entry/[name]-[hash].js', // 入口文件
        chunkFileNames:'assets/js/chunk/[name]-[hash].js',  // chunk文件
        assetFileNames(assetInfo){ // 静态资源拆分策略函数
          if(assetInfo.name?.endsWith('css')){
            return 'assets/css/[name]-[hash].css'  
          }
          if(assetInfo.name && /\.(gif|jpe?g|png|svg)$/.test(assetInfo.name)){
            return 'assets/imgs/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
```

## 移除生产环境下的日志和输出
```typescript
export default defineConfig(({mode})=>({
  esbuild:{
    drop:mode == 'production' ? ['console','debugger'] : []
  }
}))
```

## 其他可优化项
1. 针对小图片资源，定制一个阈值将其转为base64内嵌减少Http请求
2. 使用由图床服务提供的压缩版本的静态资源(当前也可以借助Vite钩子结合Sharp、Compress进行打包阶段的优化处理)
3. 使用gzip服务(减少客户端压力，但是会增加服务端压力)
4. ...待续