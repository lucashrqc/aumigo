<script setup lang="ts">
import { Heart } from '@lucide/vue'
</script>

<template>
  <aside
    class="flex flex-col gap-6 rounded-[20px] bg-cream-soft p-6 lg:gap-7 lg:p-10"
  >
    <div class="flex flex-row gap-5 lg:flex-col lg:gap-5">
      <div class="flex flex-1 flex-col gap-3 pt-1 lg:flex-none lg:gap-4">
        <div class="flex items-center gap-2">
          <span class="h-px w-6 bg-forest" />
          <span class="text-[11px] font-semibold tracking-[1.5px] text-forest">
            CONEXÕES QUE TRANSFORMAM
          </span>
        </div>
        <h2
          class="text-[26px] font-medium leading-[1.15] tracking-[-1.4px] text-forest lg:text-[40px] lg:tracking-[-1.7px]"
        >
          Seu próximo amor<br >tem quatro patas.
        </h2>
        <p class="text-[14px] leading-[1.6] text-forest/75 lg:text-[15px]">
          Um novo começo para eles.<br >Uma vida com mais amor para você.
        </p>
      </div>

      <div
        class="h-[184px] w-[126px] shrink-0 self-center overflow-hidden rounded-b-[12px] rounded-t-[60px] lg:h-[506px] lg:w-full lg:rounded-t-[220px]"
      >
        <img
          src="/images/aumigo/dog-cat-home.avif"
          alt="Um cão e um gato juntos em casa"
          class="h-full w-full object-cover"
        >
      </div>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-[12px] text-forest"
        >Encontre seu novo melhor amigo.</span
      >
      <Heart class="size-[18px] text-forest" />
    </div>
  </aside>
</template>
