<script lang="ts">
  import { Image } from 'astro:assets';
  import type { ImageMetadata } from 'astro';
  export let images: ImageMetadata[] = [];

  let currentIndex = 0;

  const nextImage = () => {
    currentIndex = (currentIndex + 1) % images.length;
  }

  import { onMount, onDestroy } from 'svelte';
  let interval;

  onMount(() => {
    interval = setInterval(nextImage, 3000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div>
  {#each images as image, i}
    <figure class:active={i === currentIndex}>
      <img
        src={image} 
        alt="スライドショウの画像 {i + 1}" 
        width={800}
        height={500}
        loading="eager"
      />
    </figure>
  {/each}
</div>

<style lang="scss">

</style>