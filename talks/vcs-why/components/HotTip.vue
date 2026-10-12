<script setup lang="ts">
// A "hot tip" sticker in the top right corner, marking a practical aside that
// breaks from the talk's story. Inside a v-click, it appears with that click.
// style.css also turns the slide's title rule orange while the sticker shows.
defineProps<{ label?: string }>()
</script>

<template>
  <div class="hot-tip">
    <ph-fire-fill class="icon" />
    <span>{{ label ?? 'Hot tip' }}</span>
  </div>
</template>

<style scoped>
.hot-tip {
  @apply absolute top-8 right-10 flex items-center gap-2 px-4 py-2 rounded-full font-bold uppercase tracking-wider text-sm;
  background: var(--vcs-hot);
  color: var(--vcs-bg);
  transform: rotate(4deg);
  box-shadow: 0 0 0 4px var(--vcs-bg), 0 0 0 6px var(--vcs-hot), 0 6px 18px -4px rgb(194 65 12 / 0.55);
}
.icon { @apply text-lg; }
</style>
