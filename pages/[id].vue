<template>
    <div>
        <div v-if="status === 'error'">
            <div class="flex justify-center items-center h-96">
                <UAlert icon="ri:error-warning-line" color="primary" variant="soft" title="发生错误"
                    description="访问受限，或因页面不存在导致无法访问。" />
            </div>
        </div>
        <div v-else>
            <div class="-mt-5 sm:mt-8">
                <div class="text-[1.35rem] sm:text-2xl font-bold mb-3">{{ post?.title }}</div>

                <div class="flex justify-between items-center text-gray-600 text-[0.9rem]">
                    <div class="flex items-center space-x-0 sm:space-x-4">
                        <UBadge variant="solid" color="white" v-if="post.tag && post?.tag.name"
                            class="select-none pointer-events-none opacity-70 hidden sm:block">{{
                                post?.tag.name }}</UBadge>

                        <div class="items-center flex">
                            {{ useFormatDate(post?.date_created) }}发布
                            <UIcon name="ri:arrow-drop-right-line" class="w-5 h-5 text-gray-600 mx-1" />
                            阅读约需 {{ useReadingTime(post?.content) }}
                        </div>
                    </div>
                    <div v-if="post?.date_updated">{{ useFormatDate(post?.date_updated) }}更新</div>
                </div>

                <div class="flex flex-row items-center space-x-10" v-if="post?.authors?.length">
                    <div class="group flex items-center mt-6" v-for="author in post?.authors">
                        <UAvatar size="md" :src="`${useAssets(author.authors_id.avatar.filename_disk)}?fit=outside&quality=40&withoutEnlargement&width=100&height=100`"
                            :alt="author.authors_id.name" class="ring-2 ring-gray-800" />
                        <div class="ml-4">
                            <p class="text-base font-medium text-gray-200">
                                {{ author.authors_id.name }}
                            </p>
                            <p class="text-[0.8rem] text-gray-600">
                                {{ author.authors_id.title }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="space-y-6 mt-6">
                    <div v-if="post?.github_link" class="my-6">
                        <GithubCard :githubUrl="post?.github_link" />
                    </div>

                    <MarkdownRenderer :markdown="post?.content" />
                </div>
            </div>

            <div class="my-8 text-base text-gray-600 space-y-8">

                <div v-if="authStore.user" class="py-4">
                    <CommentForm :post_id="post?.id" :user_id="authStore.user.id" />
                </div>

                <CommentCounter :post_id="post?.id" />
                <CommentComments :post_id="post?.id" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const { $directus, $readItem } = useNuxtApp()
const route = useRoute()
const authStore = useAuthStore();

// 监听 updated 事件
const { on: onUpdated } = useEventBus<string>('updated');

const { data: post, status, refresh } = await useAsyncData(`post-${route.params.id}`, async () => {
    const postId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
    return await $directus.request(
        $readItem('posts', postId, {
            fields: ['*.*', { '*.*': ['*.*'] }]
        })
    )
})

onUpdated((msg) => {
    if (msg === 'isUpdated') {
        refresh(); // 刷新数据
    }
});

useSeoMeta({
    title: computed(() => post.value?.title || 'Eric'),
})
</script>