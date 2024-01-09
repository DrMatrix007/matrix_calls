<script lang="ts">
  import ServerSocket from "$lib/messages";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  let contacts = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Doe", email: "jane@example.com" },
    // Add more contacts as needed
  ];

  let selectedContact: any | null = null;
  let messages: any[] = [];

  let current_message: string = "";

  let socket_write = writable<ServerSocket | null>(null);

  let socket: ServerSocket | null = null;

  socket_write.subscribe((x) => (socket = x));

  onMount(() => {
    console.log("creating");
    let sock = new ServerSocket();
    socket_write.set(sock);
  });

  async function sendMessage() {
    console.log(current_message);
    socket?.sendMessage({ message: current_message });
    current_message = "";
    setTimeout(() => {
      current_message = "";
    });
  }
</script>

<div class="container">
  <div class="contact-list">
    {#each contacts as contact (contact.id)}
      <button class="contact" on:click={() => (selectedContact = contact)}>
        <p>{contact.name}</p>
        <p>{contact.email}</p>
      </button>
    {/each}
  </div>
  <div class="chat">
    {#if selectedContact}
      <div class="chat-header">
        <p>Chatting with {selectedContact.name}</p>
      </div>
      <div class="message-list">
        {#each messages as message (message.text)}
          <div class="message">
            <p>{message.sender}</p>
            <p>{message.text}</p>
          </div>
        {/each}
      </div>
      <div class="message-input">
        <textarea
          placeholder="Type your message..."
          bind:value={current_message}
          on:keydown={(event) => {
            if (event.key == "Enter" && !event.shiftKey) {
              sendMessage();
            }
          }}
        />
        <button
          on:click={() => {
            sendMessage();
          }}>Send</button
        >
      </div>
    {:else}
      <div class="chat-header">
        <p>Select a contactname</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .chat {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .chat-header {
    background-color: #333;
    color: white;
    padding: 10px;
    text-align: center;
  }

  .message-list {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
  }

  .message {
    margin-bottom: 10px;
  }

  .message-input {
    display: flex;
    align-items: center;
    padding: 10px;

    /* background-color: #eee; */
  }

  .message-input textarea {
    flex-grow: 1;
    margin-right: 10px;
    padding: 5px;
    background-color: #333;
    border: 0;
    border-radius: 5px;
    box-shadow: 0 0 3px black;
  }

  .message-input button {
    cursor: pointer;
    padding: 5px 10px;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 5px;
  }

  .container {
    width: 100%;
    height: 100%;
    display: flex;
    padding: 0;
    margin: 0;
    flex-grow: 1;
    flex-direction: row;
  }

  .contact-list {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 200px;
    padding: 20px;
    /* margin-left: 15px; */
    margin-right: 15px;
    /* box-shadow: 0 0 10px black; */
    background-color: #333; /* Dark background color */
  }

  .contact {
    cursor: pointer;
    color: white;
    margin-bottom: 15px;
    padding: 10px;
    background-color: #666;
    border-radius: 5px;
    border: none;
    text-align: left;
    font-size: 1rem;
    overflow-x: hidden;
    transition: background-color 0.3s ease;
  }

  /* .contact:hover { */
  /* } */
</style>
