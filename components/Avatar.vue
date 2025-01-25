<template>
    <div class="relative">
        <!-- 显示当前头像 -->
        <div class="relative w-20 h-20 rounded-full cursor-pointer" @click="openFileInput">
            <UAvatar size="3xl"
                :src="`${currentAvatarUrl || ''}?fit=outside&quality=50&withoutEnlargement&width=120&height=120`"
                :alt="authStore.user?.first_name" class="ring-2 ring-gray-800" />
            <!-- 删除图标 -->
            <div v-if="currentAvatarId" class="absolute -bottom-1 -right-2 cursor-pointer" @click.stop="deleteAvatar">
                <div class="ring-2 ring-zinc-900 bg-zinc-900 rounded-full w-6 h-6">
                    <UIcon name="ri:close-circle-fill" class="w-6 h-6 text-red-500" />
                </div>
            </div>
        </div>

        <!-- 隐藏的文件输入 -->
        <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/jpeg, image/png, image/gif"
            class="hidden" />

        <!-- 加载动画 -->
        <div v-if="isLoading"
            class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <UIcon name="ri:loader-3-line" class="w-8 h-8 animate-spin text-white" />
        </div>
    </div>
</template>

<script setup lang="ts">
const { $authClient, $readFile, $uploadFiles, $deleteFile, $updateUser, $readMe } = useNuxtApp();

const authStore = useAuthStore();
const fileInput = ref<HTMLInputElement | null>(null); // 文件输入引用

const file = ref<File | null>(null); // 用户选择的文件
const currentAvatarId = ref<string | null>(null); // 当前头像的文件 ID
const currentAvatarUrl = ref<string | null>(null); // 当前头像的 URL

interface User {
    id: string;
    email: string;
    first_name: string;
    avatar: string;
}

// 打开文件选择对话框
const openFileInput = () => {
    fileInput.value?.click();
};

// 处理文件选择
const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        const uploadedFile = target.files[0];
        // 检查文件格式和大小
        if (['image/jpeg', 'image/png', 'image/gif'].includes(uploadedFile.type) && uploadedFile.size <= 2 * 1024 * 1024) {
            file.value = uploadedFile;
            uploadAvatar();
        } else {
            alert('文件格式不支持或文件大小超过2MB');
        }
    }
};

const isLoading = ref(false); // 加载状态

// 上传头像
const uploadAvatar = async () => {
    if (!file.value) return;

    isLoading.value = true; // 开始加载

    const formData = new FormData();
    formData.append('file', file.value);

    try {
        // 如果用户已经有头像，先删除旧头像
        if (currentAvatarId.value) {
            await $authClient.request($deleteFile(currentAvatarId.value));
        }

        // 上传新头像
        const uploadResponse = await $authClient.request($uploadFiles(formData));

        // 确保 uploadResponse 是一个对象，并且包含文件信息
        if (uploadResponse && uploadResponse.id) {
            const fileId = uploadResponse.id; // 获取上传文件的 ID

            // 更新用户记录中的头像字段
            await $authClient.request(
                $updateUser(authStore.user?.id || '', { avatar: fileId }) // 假设 currentUserId 是当前用户的 ID
            );

            const updatedUser = await $authClient.request($readMe({ fields: ['id', 'email', 'first_name', 'avatar'] })) as User;
            authStore.setUser(updatedUser);

            // 更新当前头像信息
            currentAvatarId.value = fileId;
            currentAvatarUrl.value = useAssets(fileId); // 构建文件 URL

            // 清空文件输入
            file.value = null;
        } else {
            console.error('上传失败：返回的文件信息无效', uploadResponse);
        }
    } catch (error) {
        console.error('上传失败', error);
    } finally {
        isLoading.value = false; // 结束加载
    }
};

// 删除头像
const deleteAvatar = async () => {
    if (!currentAvatarId.value) return;

    isLoading.value = true; // 开始加载

    try {
        // 删除 Directus 中的文件记录
        await $authClient.request($deleteFile(currentAvatarId.value));

        // 清空当前头像信息
        currentAvatarId.value = null;
        currentAvatarUrl.value = null;

        // 更新用户记录中的头像字段
        await $authClient.request(
            $updateUser(authStore.user?.id || '', { avatar: null })
        );

        const updatedUser = await $authClient.request($readMe({ fields: ['id', 'email', 'first_name', 'avatar'] })) as User;
        authStore.setUser(updatedUser);
    } catch (error) {
        console.error('删除失败', error);
    } finally {
        isLoading.value = false; // 结束加载
    }
};

// 初始化时读取当前用户头像
const fetchCurrentAvatar = async () => {
    try {
        const avatarId = authStore.user?.avatar;
        if (avatarId) {
            const avatarResponse = await $authClient.request($readFile(avatarId, { fields: ['*'] }));

            // 更新当前头像信息
            currentAvatarId.value = avatarResponse.id;
            currentAvatarUrl.value = useAssets(avatarResponse.id);
        }
    } catch (error) {
        console.error('读取头像失败', error);
    }
};

// 组件加载时获取当前头像
fetchCurrentAvatar();

// 暴露 fetchCurrentAvatar 方法，供父组件调用
defineExpose({ fetchCurrentAvatar });
</script>