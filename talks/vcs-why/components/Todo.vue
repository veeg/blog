<script setup lang="ts">
// A placeholder for content still to be added to the deck, such as a screenshot.
// Easy to find again: grep for "<Todo".
</script>

<template>
  <div class="todo">
    <span class="label">TODO</span>
    <span><slot /></span>
  </div>
</template>

<style scoped>
.todo {
  @apply flex flex-col items-center justify-center gap-2 mt-6 p-8 rounded-lg border-2 border-dashed border-orange-400 text-orange-500 text-center;
  min-height: 12rem;
}
.label { @apply text-xs font-bold tracking-widest; }
</style>
