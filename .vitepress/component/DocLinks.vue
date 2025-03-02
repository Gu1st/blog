<script setup lang="ts">
/**
 * 定义 `Item` 接口，用于描述链接项的结构。
 *
 * @interface Item
 * @property {string} name - 链接项的名称。
 * @property {string} link - 链接项的 URL。
 * @property {string} [color] - 图标的颜色（可选）。
 * @property {string} [icon] - 图标的 URL 或类名（可选）。
 * @property {string} [light] - 浅色模式下的图标 URL（可选）。
 * @property {string} [dark] - 深色模式下的图标 URL（可选）。
 */
interface Item {
  name: string
  link: string
  color?: string
  icon?: string
  light?: string
  dark?: string
}

/**
 * 定义 `items` 属性，类型为 `Item` 数组，是组件的必需属性。
 *
 * @property {Item[]} items - 链接项数组，每项遵循 `Item` 接口。
 */
const props = defineProps<{
  items: Item[]
}>()

/**
 * 判断给定的 URL 是否为图像文件。
 *
 * @param {string} url - 要判断的 URL。
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
    <!-- 遍历 `items` 数组，渲染每个链接项 -->
    <a
      v-for="item in items"
      :key="item.name"
      class="link"
      :href="item.link"
      :title="item.name"
      :target="isExternalLink(item.link) ? '_blank' : '_self'"
      rel="noopener"
    >
      <!-- 渲染图标 -->
      <span class="box">
        <template v-if="item.icon">
          <img
            v-if="isImage(item.icon)"
            :src="item.icon"
            alt="Icon"
            class="icon"
          />
          <i
            v-else
            :class="item.icon + ' fa-2xl icon'"
            :style="{ color: item.color }"
          ></i>
        </template>
        <template v-else>
          <img
            v-if="item.light"
            :src="item.light"
            alt="Icon"
            class="icon light-only"
          />
          <img
            v-if="item.dark"
            :src="item.dark"
            alt="Icon"
            class="icon dark-only"
          />
          <i
            v-if="!item.light && !item.dark"
            class="fas fa-arrow-up-right-from-square fa-lg fa-icon"
          ></i>
        </template>
      </span>

      <!-- 渲染链接项的名称 -->
      <span class="name">{{ item.name }}</span>
    </a>
  </div>
</template>

<style lang="scss" scoped>
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
  width: 100%;
  height: 3rem;
  border: 1px dotted var(--vp-c-bg-alt);
  background-color: var(--vp-c-bg-alt);
  border-radius: 0.8rem;
  display: flex;
  align-items: center;
  position: relative;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-decoration: none !important;

  &:hover {
    border-color: var(--vp-c-brand-1);
  }
}

.box {
  position: relative;

  &:hover .icon,
  .name {
    color: var(--vp-c-brand-1);
  }
}

.icon-only {
  width: 2rem;
  margin-left: 1.5rem;
  margin-top: -1.5rem;
}

.icon {
  width: 2rem;
  margin-left: 1.5rem;
}

.fa-icon {
  width: 2rem;
  margin-left: 1.5rem;
  margin-top: -1.5rem;
}

.name {
  font-size: 0.87rem;
  margin-left: 1rem;
}
</style>
