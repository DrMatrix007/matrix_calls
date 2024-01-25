<script lang="ts">
  import { current_user } from "$lib/user";
  import type { User } from "@auth/core/types";
  import { onMount } from "svelte";
  import { signIn, signOut } from "@auth/sveltekit/client";
  let user: null | User = null;
  onMount(() => {
    const unsub = current_user.subscribe((data) => {
      user = data ?? null;
    });
    return unsub;
  });
</script>

<div class="navbar">
  <h1>Matrix Calls</h1>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contacts">Contacts</a>
  <div style="flex-grow: 1;"></div>
  {#if user}
    <div class="profile">
      <p>logged in as {user.name}</p>
      <button on:click={() => signOut()}>logout</button>
    </div>
  {:else}
    <button on:click={() => signIn("github")}> login with github</button>
    <button on:click={() => signIn("spotify")}> login with spotify </button>
  {/if}
</div>

<slot />

<style>
  :global(body),
  :global(html),
  :global(.main_holder) {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-width: 100vw;
    max-width: 100vw;
    padding: 0;
    margin: 0;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    background-color: #1f1f1f; /* Dark background color for the entire page */
    color: #fff;
  }
  .navbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background-color: #333; /* Change the color as needed */
  }
  .navbar > * {
    margin-right: 20px;
  }
  .navbar a {
    color: #fff;
    text-decoration: none;
    text-align: center;
    margin: 0 15px;
  }

  .navbar a:hover {
    text-decoration: underline;
  }

  .profile {
    display: flex;
    flex-direction: row;
    align-items: center;
    /* justify-items: center; */
  }
  .profile > * {
    margin: 10px;
  }
</style>
