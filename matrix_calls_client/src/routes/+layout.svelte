<script lang="ts">
</script>

<!-- <h1>Layout</h1> -->

<slot />

<style>
  :global(body),
  :global(html),
  :global(.main_holder) {
    display: flex;
    min-height: 100vh;
    min-width: 100vw;
    max-width: 100vw;
    padding: 0;
    margin: 0;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    background-color: #1f1f1f; /* Dark background color for the entire page */
    color: #fff;
  }
</style>
