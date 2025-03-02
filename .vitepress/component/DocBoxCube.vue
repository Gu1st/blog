<script setup lang="ts">
/**
 * `Item` 接口定义了项目的结构。
 *
 * @interface Item
 * @property {string} icon - 图标的 URL 或类名。
 * @property {string} name - 项目的名称。
 * @property {string} link - 项目的链接。
 * @property {string} [desc] - 项目的描述（可选）。
 * @property {string} [color] - 图标的颜色（可选）。
 * @property {string} [light] - 浅色模式下的图标 URL（可选）。
 * @property {string} [dark] - 深色模式下的图标 URL（可选）。
 */
interface Item {
  icon: string
  name: string
  link: string
  desc?: string
  color?: string
  light?: string
  dark?: string
}

/**
 * 定义组件的 `props`。
 *
 * @property {Item[]} items - 包含多个 `Item` 对象的数组。
 * 该属性为必需的。
 */
const props = defineProps<{
  items: Item[]
}>()

/**
 * 判断给定的 URL 是否为图像文件。
 *
 * @param {string} url - 要检查的 URL。
 * @returns {boolean} - 如果 URL 是图像文件，则返回 `true`，否则返回 `false`。
 */
const isImage = (url: string): boolean =>
  /\.(png|jpe?g|gif|svg|webp|bmp|tif?f|tiff|ico|avif)(\?.*)?$/.test(url)

/**
 * 判断给定的链接是否是外部链接。
 *
 * @param {string} link - 要判断的链接。
 * @returns {boolean} - 如果链接是外部链接，则返回 `true`，否则返回 `false`。
 */
const isExternalLink = (link: string): boolean => /^https?:\/\//.test(link)
</script>

<template>
  <!-- 渲染包含多个链接项的容器 -->
  <div class="box-container">
    <!-- 遍历 `items` 数组，渲染每个项目 -->
    <a
      v-for="(item, index) in items"
      :key="item.name + index"
      class="link"
      :href="item.link"
      :title="item.name"
      :target="isExternalLink(item.link) ? '_blank' : '_self'"
      rel="noopener"
    >
      <!-- 如果图标是图片，显示图片 -->
      <span v-if="isImage(item.icon)">
        <img :src="item.icon" alt="icon" class="img" />
      </span>
      <!-- 如果图标不是图片，显示 Font Awesome 图标 -->
      <span v-else class="icon">
        <i :class="item.icon + ' fa-2xl'" :style="{ color: item.color }"></i>
      </span>
      <!-- 显示浅色模式下的图标 -->
      <img
        v-if="item.light"
        :src="item.light"
        alt="icon"
        class="img light-only"
      />
      <!-- 显示深色模式下的图标 -->
      <img v-if="item.dark" :src="item.dark" alt="icon" class="img dark-only" />
      <!-- 显示项目名称 -->
      <span class="name">{{ item.name }}</span>
      <!-- 显示项目描述 -->
      <span class="desc">{{ item.desc }}</span>
    </a>
  </div>
</template>

<style lang="scss" scoped>
/**
 * 处理不同模式下的图标显示：暗色模式下隐藏浅色图标，浅色模式下隐藏暗色图标。
 */
:root:not(.dark) .dark-only,
:root:is(.dark) .light-only {
  display: none;
}

.box-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.link {
  width: 8.2rem;
  height: 8.2rem;
  border: 1px dotted var(--vp-c-bg-alt);
  background-color: var(--vp-c-bg-alt);
  border-radius: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: border-color 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);

  @media (max-width: 1024px) {
    flex: 1 1 calc(25% - 0.5rem);
    max-width: calc(25% - 0.5rem);
  }

  @media (max-width: 768px) {
    flex: 1 1 calc(33.33% - 0.5rem);
    max-width: calc(33.33% - 0.5rem);
  }

  &:hover {
    border-color: var(--vp-c-brand-1);
  }

  .icon {
    margin-top: -1rem;
    font-size: 1.2rem;
    color: var(--vp-c-text-1);
  }

  .img {
    width: 2.5rem;
    margin-top: -1rem;
  }

  .name {
    position: absolute;
    font-size: 0.87rem;
    bottom: 1.25rem;
  }

  .desc {
    position: absolute;
    font-size: 0.75rem;
    bottom: 0.15rem;
    color: var(--vp-c-text-3);
  }
}
</style>
