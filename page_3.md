---
page: true
aside: false
---
<script setup>
import { Page } from "@theojs/solis";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(14,21);
</script>
<Page :posts="posts" :pageCurrent="3" :pagesNum="3" />