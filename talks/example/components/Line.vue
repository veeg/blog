<script setup lang="ts">
// One line of a file. `id` gives it a stable identity across slides
// (via view-transition-name), `kind` colors it by who wrote it.
defineProps<{
  id?: string
  kind?: 'plain' | 'base' | 'alice' | 'bob'
  tag?: string
}>()
</script>

<template>
  <div
    class="line"
    :class="kind ?? 'plain'"
    :style="id ? { viewTransitionName: id } : undefined"
  >
    <slot />
    <sub v-if="tag" class="tag">{{ tag }}</sub>
  </div>
</template>

<style scoped>
.line {
  @apply w-14 h-10 rounded font-mono font-bold text-lg text-white flex items-center justify-center;
}
.plain { @apply bg-gray-500; }
.base { @apply bg-teal-600; }
.alice { @apply bg-orange-500; }
.bob { @apply bg-purple-600; }
.tag { @apply text-xs opacity-80 ml-0.5; }
</style>
