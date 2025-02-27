import { defineConfig } from 'vitepress'
// @ts-expect-error
import { getPosts } from '@theojs/solis/utils'

const posts = { posts: await getPosts(7) }

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Harexs',
  description: '可惜一溪风月,莫教踏碎琼瑶',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    // [
    //   'script',
    //   { src: './twikoo.all.min.js' }
    // ],
  ],
  ignoreDeadLinks: true,
  cleanUrls: true,
  themeConfig: {
    ...posts,
    search: {
      provider: 'local',
    },
    logo: { src: '/logo.awebp' },
    outline: {
      level: [2, 4],
      label: '页面大纲',
    },
    nav: [
      { text: '主页', link: '/' },
      { text: '分类', link: '/pages/category' },
      { text: '归档', link: '/pages/archives' },
      { text: '标签', link: '/pages/tags' },
      // { text: '作品', link: '/pages/works' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/gu1st' },
      {
        icon: {
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm8-7.175q.125 0 .263-.038t.262-.112L19.6 8.25q.2-.125.3-.312t.1-.413q0-.5-.425-.75T18.7 6.8L12 11L5.3 6.8q-.45-.275-.875-.012T4 7.525q0 .25.1.438t.3.287l7.075 4.425q.125.075.263.113t.262.037"  fill="#1E80FF"/></svg>`,
        },
        link: 'mailto:master@gu1st.cn',
      },
      {
        icon: {
          svg: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="28" viewBox="0 0 36 28" fill="none">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M17.5875 6.77268L21.8232 3.40505L17.5875 0.00748237L17.5837 0L13.3555 3.39757L17.5837 6.76894L17.5875 6.77268ZM17.5863 17.3955H17.59L28.5161 8.77432L25.5526 6.39453L17.59 12.6808H17.5863L17.5825 12.6845L9.61993 6.40201L6.66016 8.78181L17.5825 17.3992L17.5863 17.3955ZM17.5828 23.2891L17.5865 23.2854L32.2133 11.7456L35.1768 14.1254L28.5238 19.3752L17.5865 28L0.284376 14.3574L0 14.1291L2.95977 11.7531L17.5828 23.2891Z" fill="#1E80FF"/>
     </svg>`,
        },
        link: 'https://juejin.cn/user/281906876257511',
      },
    ],
    // footer: {
    //   message: `©${new Date().getFullYear()} Harexs. All Rights Reserved.`,
    //   copyright: `Theme by Theo-Messi`
    // }
  },
})
