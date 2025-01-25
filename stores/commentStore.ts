export const useCommentStore = defineStore('comments', () => {
  const { $directus, $readItems } = useNuxtApp();
  const comments = ref<any[]>([]);

  // 获取评论数据
  const fetchComments = async (postId: string) => {
    try {
      const data = await $directus.request(
        $readItems('comments', {
          fields: ['*', { user_created: ['*'] }],
          filter: { post_id: { _eq: postId } },
          sort: '-date_created',
        })
      );
      comments.value = data;
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  };

  // 清空评论数据
  const clearComments = () => {
    comments.value = [];
  };

  return {
    comments,
    fetchComments,
    clearComments,
  };
});