// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { Archives, Category, Tags, Page } from '@theojs/solis'
import './style.css'
import '@theojs/lumen/theme'

import { HomeFooter } from '@theojs/lumen'
import { Footer_Data } from '../data/footerData'
import { ShareButton } from '@theojs/lumen'

// import { DocAsideLogo } from '@theojs/lumen'
// import { Aside_Data } from '../data/AsideData'
import { DocVideoLink } from '@theojs/lumen'  // 视频组件 用法：<VideoLink href="//player.bilibili.com/player.html?aid=1205847484" name="【MV】HELP!! - 可波·卡娜埃露" />
import DocBox from '../component/DocBox.vue'
import DocLinks from '../component/DocLinks.vue'
import DocBoxCube from '../component/DocBoxCube.vue'

// twikoo插件 由于主站ssl 所以后端也必须ssl， 暂时没有额外的ssl凭证，先停用
// import { Twikoo } from '@theojs/lumen'
// import { Twikoo_Data } from '../data/Twikoo'
// import Twikoo from '../component/Twikoo.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(HomeFooter, { Footer_Data }),
      'aside-outline-before': () => h(ShareButton),
      // 'aside-ads-before': () => h(DocAsideLogo, { Aside_Data })  // 侧边栏链接
      // 'doc-after': () => h(Twikoo, {envId:Twikoo_Data.envId}),
      // 'doc-after': () => h(Twikoo, {Twikoo_Data}),
    }) 
  },
  enhanceApp: ({ app }) => {
    app.component('Tags', Tags)
    app.component('Category', Category)
    app.component('Archives', Archives)
    app.component('Page', Page)
    app.component('VideoLink', DocVideoLink) 
    app.component('Box', DocBox)
    app.component('Links', DocLinks)
    app.component('BoxCube', DocBoxCube)
  },
}