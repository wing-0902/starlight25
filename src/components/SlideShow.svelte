<script>
  export let imagePaths = []; 

  let currentIndex = 0;

  const nextImage = () => {
    currentIndex = (currentIndex + 1) % imagePaths.length;
  };

  $: currentPath = imagePaths[currentIndex];
</script>

<div class="slideshow-container">
  {#each imagePaths as path, i}
    <figure class:active={i === currentIndex}>
      <img src={path} alt="スライドショウの画像 {i + 1}" />
    </figure>
  {/each}
</div>