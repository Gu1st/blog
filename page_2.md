---
page: true
aside: false
---
<script setup>
import { Page } from "@theojs/solis";
import { useData } from "vitepress";
const { theme } = useData();
const posts = theme.value.posts.slice(7,14);
</script>
<Page :posts="posts" :pageCurrent="2" :pagesNum="3" />