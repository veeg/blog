<script setup lang="ts">
// Slide number in the bottom right corner, on every slide but the cover and the
// full-colour section slides.
</script>

<template>
  <div
    v-if="!['cover', 'section'].includes($nav.currentLayout)"
    class="absolute bottom-4 right-6 flex items-center gap-2 font-mono text-xs text-[#6f6a62]"
  >
    <span class="inline-block w-2 h-2 rounded-full bg-[#1d6f66]" />
    {{ $nav.currentPage }} / {{ $nav.total }}
  </div>
</template>
