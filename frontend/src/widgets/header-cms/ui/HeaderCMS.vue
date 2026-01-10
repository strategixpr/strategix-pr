<script setup lang="ts">
  import StrategixLogo from '@/assets/images/strategix-black.svg'
</script>

<template>
  <header class="flex flex-col">
    <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <NuxtImg
        :src="StrategixLogo"
        alt="Strategix logo"
        class="h-10 w-auto"
        :width="172"
        :height="36"
      />
      <h1 class="text-3xl font-bold sm:text-right">
        <slot />
      </h1>
    </div>
  </header>
</template>
