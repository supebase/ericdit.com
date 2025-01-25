<template>
  <div class="my-8">
    <main class="content space-y-2 relative" id="content">
      <section class="section container section-posts section-featured space-y-5 sm:space-y-10"
        v-for="(group, index) in sortedGroupedPosts" :key="group.year">
        <div class="relative h-20 pointer-events-none select-none">
          <div
            class="absolute -top-16 -left-9 text-[6.5rem] sm:text-[8rem] font-bold text-transparent year-stroke -z-10">
            {{ group.year }}
          </div>
        </div>
        <div class="swiper featured-slider">
          <div class="swiper-wrapper">
            <div class="swiper-slide" v-for="post in group.posts" :key="post.id">
              <article class="card card-post">
                <div class="card-header">
                  <NuxtLink :href="post.id"
                    class="card-title truncate text-gray-100"
                    tabindex="-1">{{ post.title }}</NuxtLink>
                  <div class="card-meta mt-2.5 flex items-center">
                    <time class="card-date">
                      <UTooltip v-if="post.date_updated"
                        :popper="{ arrow: true, placement: 'right', offsetDistance: 12 }">
                        <div class="text-gray-500 text-[13px] select-none cursor-help">
                          {{ useFormatDate(post.date_created) }}
                        </div>
                        <template #text>
                          <span>{{ useFormatDate(post.date_updated) }}更新</span>
                        </template>
                      </UTooltip>
                      <div v-else class="text-gray-500 text-[13px] select-none">
                        {{ useFormatDate(post.date_created) }}
                      </div>
                    </time>
                    <UIcon name="ri:arrow-drop-right-line" class="w-5 h-5 text-gray-600" />
                    <div class="text-gray-500 text-[13px] select-none">
                      阅读约需 {{ useReadingTime(post.content) }}
                    </div>
                  </div>
                </div>
                <div class="card-content line-clamp-4 text-gray-300/90">
                  {{ post.summary }}
                </div>
                <div class="card-footer flex items-center justify-between">
                  <UBadge variant="solid" color="white" v-if="post.tag" class="select-none opacity-70">{{
                    post.tag.name }}</UBadge>
                  <CommentCounter :post_id="post.id" :isHome="true" />
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import Swiper from 'swiper';
import { EffectCards } from 'swiper/modules';
import 'swiper/css/bundle';

const { $directus, $readItems } = useNuxtApp()
const { showNotification } = useNotification()

const { on: postUpdated } = useEventBus<string>('updated')

const { data: posts, error, refresh } = await useAsyncData('posts', async () => {
  return await $directus.request(
    $readItems('posts', {
      fields: ['*.*'],
      sort: ['-date_created'],
      filter: { status: 'published' },
    })
  )
})

postUpdated((msg) => {
  if (msg === 'isUpdated') {
    showNotification('post-change', 'success', "检测到页面变更，刷新页面加载最新内容。");
  }
});

// 按年份分组并降序排列
const sortedGroupedPosts = computed(() => {
  if (error.value || !posts.value || !Array.isArray(posts.value)) return [];

  const grouped = posts.value.reduce((acc, post) => {
    const year = new Date(post.date_created).getFullYear().toString();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {} as Record<string, typeof posts.value>);

  return Object.keys(grouped)
    .sort((a, b) => Number(b) - Number(a))
    .map(year => ({
      year,
      posts: grouped[year]
    }));
});

// 初始化 Swiper
onMounted(() => {
  new Swiper('.featured-slider', {
    modules: [EffectCards], // 注册 CardsEffect 模块
    effect: 'cards', // 启用卡片效果
    cardsEffect: {
      slideShadows: true, // 关闭阴影
      perSlideRotate: 3, // 每张卡片的旋转角度
      perSlideOffset: 8, // 每张卡片的偏移量
    },
    grabCursor: true, // 启用抓取光标
    touchRatio: 0.4, // 触摸灵敏度
  });
});

useSeoMeta({
  title: 'Eric',
});
</script>