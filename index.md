---
page: true
aside: false
---
<script setup>
import { Page } from "@theojs/solis";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(0,7);
</script>
<Page :posts="posts" :pageCurrent="1" :pagesNum="3" />