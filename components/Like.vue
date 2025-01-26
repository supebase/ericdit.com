<template>
    <div class="flex items-center space-x-1.5 select-none"
        :class="{ 'cursor-pointer': canLike && !loading, 'opacity-50': !canLike || loading }" @click="handleClickLike">
        <div class="relative w-8 h-8" :class="{ 'animate-like': isAnimating }" @animationend="isAnimating = false">
            <UIcon
                :name="hasLiked ? 'pepicons-pop:hands-clapping-checkmark-circle-filled' : 'pepicons-pop:hands-clapping-circle-filled'"
                class="w-8 h-8 transition-all duration-300 "
                :class="{ 'text-gray-300': hasLiked, 'text-gray-200': !hasLiked }" />
        </div>
        <div class="git-nums min-w-[24px] text-center transition-all duration-300 overflow-hidden"
            :class="{ 'text-gray-300': hasLiked, 'text-gray-200': !hasLiked }">
            <div class="number-roll" :style="{ transform: `translateY(${translateY}%)` }">
                <div v-for="num in numbers" :key="num">{{ num }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const { $directus, $readItems, $createItem } = useNuxtApp()
const { showNotification } = useNotification()

const props = defineProps({
    post_id: { type: String, required: true },
    user_id: { type: String, default: null },
    target_type: { type: String, required: true },
})

// 状态管理
const loading = ref(true)
const likes = ref<Array<any>>([])
const hasLiked = ref(false)
const canLike = computed(() => !hasLiked.value && !!props.user_id)
const likesCount = computed(() => likes.value?.length || 0)
const isAnimating = ref(false)
const translateY = ref(0)
const numbers = ref<number[]>([])

// 获取点赞数据
const fetchLikes = async () => {
    try {
        loading.value = true
        const response = await $directus.request(
            $readItems('likes', {
                fields: ['user_created'],
                filter: { target_id: { _eq: props.post_id } }
            })
        )
        likes.value = response
        hasLiked.value = props.user_id
            ? response.some((like: any) => like.user_created === props.user_id)
            : false
        updateNumbers()
    } catch (error) {
        //console.error('获取点赞数据失败:', error)
    } finally {
        loading.value = false
    }
}

// 更新数字列表
const updateNumbers = () => {
    const currentCount = likesCount.value
    const newNumbers = Array.from({ length: 10 }, (_, i) => (currentCount + i) % 10)
    numbers.value = newNumbers
}

// 点赞处理（增加防抖）
let lastClickTime = 0
const handleClickLike = async () => {
    // 防止重复点击
    if (Date.now() - lastClickTime < 1000) return
    lastClickTime = Date.now()

    if (!props.user_id) {
        showNotification('like-login', 'error', '请先登录后在进行操作')
        return
    }

    if (hasLiked.value) {
        showNotification('liked-err', 'error', '已经点过赞了，请不要重复')
        return
    }

    try {
        loading.value = true
        isAnimating.value = true;

        // 提交点赞
        await $directus.request(
            $createItem('likes', {
                user_created: props.user_id,
                target_id: props.post_id,
                target_type: props.target_type,
            })
        )

        // 更新本地状态
        likes.value = [...likes.value, { user_created: props.user_id }]
        hasLiked.value = true
        showNotification('like-success', 'success', '点赞成功，感谢支持')

        // 触发数字滚动动画
        translateY.value = -100
        setTimeout(() => {
            translateY.value = 0
            updateNumbers()
        }, 300)
    } catch (error) {
        showNotification('like-err', 'error', '点赞时发生错误，请重试')
    } finally {
        loading.value = false
    }
}

// 初始化和监听
onMounted(fetchLikes)
watch(() => props.user_id, fetchLikes)
</script>

<style scoped>
@keyframes like {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}

.animate-like {
    animation: like 0.3s ease-in-out;
}

.git-nums {
    font-variant-numeric: tabular-nums;
    font-family: ui-monospace, monospace;
    height: 1em;
    overflow: hidden;
}

.number-roll {
    transition: transform 0.3s ease-in-out;
}

.number-roll div {
    line-height: 1em;
    height: 1em;
}
</style>