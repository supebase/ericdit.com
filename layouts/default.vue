<template>
  <div class="flex items-center">
    <div class="p-6 w-full fixed top-0 z-50 header">
      <Header />
    </div>
  </div>
  <div class="mx-auto px-6 mt-[7.5rem]" :class="$route.path === '/' ? 'max-w-md' : 'max-w-md sm:max-w-xl'">
    <slot />
  </div>

  <Footer />
</template>

<script lang="ts" setup>

</script>
