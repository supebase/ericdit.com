<template>
    <UPopover :popper="{ arrow: true }">
        <div class="mt-1.5">
           <UIcon name="fluent:emoji-sparkle-28-regular" @click="togglePicker" class="w-[21px] h-[21px] text-gray-400 cursor-pointer" /> 
        </div>
        
        <template #panel>
            <div class="p-2">
                <NuxtEmojiPicker v-if="isPickerVisible" native hide-search hide-group-icons hide-group-names
                    disable-sticky-group-names disable-skin-tones theme="dark" @select="handleEmojiSelect"
                    :disabled-groups="disabledGroups" />
            </div>
        </template>
    </UPopover>
</template>

<script setup lang="ts">
const isPickerVisible = ref(false);

const togglePicker = () => {
    isPickerVisible.value = !isPickerVisible.value;
};

const disabledGroups = ref([
    "animals_nature",
    "food_drink",
    "activities",
    "travel_places",
    "objects",
    "symbols",
    "flags"
]);

const emit = defineEmits(['emoji']);

const handleEmojiSelect = (emoji: { i: string }) => {
    emit('emoji', emoji.i);
    isPickerVisible.value = false;
};
</script>