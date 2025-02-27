<script setup>
import { onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vitepress'
import { ref } from 'vue'
// import * as twikoo from 'twikoo'
const props = defineProps({
    envId: {
        type: String
    }
})

const showTwikoo = ref(false)

async function initTwikoo() {
    if (typeof window !== 'undefined') {
        const twikoo = await import('twikoo');
        twikoo.init({
            envId: props.envId
        }).then(() => {
            showTwikoo.value = true
        })
    } else {
        showTwikoo.value = false
        Promise.reject('加载Twikoo失败')
    }
}

const route = useRoute()

onMounted(async () => {
    watch(() => route.path, async (n) => {
        // 仅文章路由才渲染
        if (n.includes('/posts/')){
            await nextTick()
            await initTwikoo()
        }else{
            // 卸载组件
            const el = document.querySelector('#twikoo')
            if(el) el.innerHTML = ''
        }
    }, {
        immediate: true
    })
})





</script>

<template>
    <div class="comment-container vp-raw">
        <!-- Twikoo -->
        <div id="twikoo"  v-show="showTwikoo"></div>
    </div>
</template>