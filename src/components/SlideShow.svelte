<script>
  import { onMount, onDestroy } from 'svelte';

  export let imagePaths = []; 

  let currentIndex = 0;
  let interval;
  const nextImage = () => {
    currentIndex = (currentIndex + 1) % imagePaths.length;
  };

  onMount(() => {
    interval = setInterval(nextImage, 3000);
  });
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="slideshow-container">
  {#each imagePaths as path, i}
    <figure class:active={i === currentIndex}>
      <img src={path} alt="スライドショウの画像 {i + 1}" />
    </figure>
  {/each}
</div>

<style>
  .slideshow-container {
    margin: 0;
    padding: 0;
    position: relative;
    overflow: hidden; /* 画像がはみ出ないように */
    /* サイズは適宜設定 */
    width: 100vw;
    height: 100dvh; 
  }
  figure {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    opacity: 0;
    transition: opacity 0.5s ease-in-out; /* ここでアニメーション（トランジション）を設定 */
  }
  img {
    width: 100vw;
    height: 100dvh;
    object-fit: cover; /* 画像をボックスに合わせてトリミング */
  }
  .active {
    opacity: 1;
  }
</style>