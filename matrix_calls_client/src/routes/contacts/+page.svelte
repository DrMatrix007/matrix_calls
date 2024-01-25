<script lang="ts">
  import ServerSocket from "$lib/messages";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import type { LayoutServerData } from "../$types";

  type Message = { sender: string; text: string };

  let contacts_write = writable<{ name: string; email: string }[]>([]);

  onMount(() => {
    return contacts_write.subscribe((data) => (contacts = data));
  });

  let contacts: { name: string; email: string }[] = [];

  let messages_write = writable<Map<string, Message[]>>(new Map());
  let messages = new Map();
  onMount(() => {
    return messages_write.subscribe((data) => (messages = data));
  });
  export let data: LayoutServerData;

  let selected_contact: string | null = null;

  let current_message: string = "";

  let socket_write = writable<ServerSocket | null>(null);

  let socket: ServerSocket | null = null;

  socket_write.subscribe((x) => (socket = x));

  onMount(() => {
    if (data.jwt) {
      console.log("creating");
      let sock = new ServerSocket(data.jwt);
      socket_write.set(sock);
      return sock.subscribe((message) => {
        console.log(message);
        handle_message(message);
      });
    }
  });

  function handle_message(data: string) {
    let obj: null | any = null;
    try {
      obj = JSON.parse(data);
    } catch (e) {}
    if (!obj) return;
    if (obj.liveUsers) {
      contacts_write.set(obj.liveUsers as [{ name: string; email: string }]);
    } else if (obj.sender && obj.text) {
      append_message(obj.sender, {
        sender: obj.sender,
        text: obj.text,
      });
    }
  }
  function append_message(selected_user: string, message: Message) {
    messages_write.update((messages) => {
      if (messages.get(selected_user)) {
        messages.get(selected_user)?.push(message);
      } else {
        messages.set(selected_user, []);
        append_message(selected_user, message);
      }
      return messages;
    });
  }
  async function sendMessage() {
    console.log(current_message);
    socket?.sendMessage({ message: current_message, to: selected_contact });
    append_message(selected_contact!, {
      text: current_message,
      sender: data.session!.user!.name!,
    });
    current_message = "";
    setTimeout(() => {
      current_message = "";
    });
  }
</script>

<div class="container">
  <div class="contact-list">
    {#each contacts as contact}
      <button
        class="contact"
        on:click={() => (selected_contact = contact.name)}
      >
        <p>{contact.name}</p>
        <p>{contact.email}</p>
      </button>
    {/each}
  </div>
  <div class="chat">
    {#if selected_contact}
      <div class="chat-header">
        <p>Chatting with {selected_contact}</p>
      </div>
      <div class="message-list">
        {#each messages.get(selected_contact) || [] as message, i (i)}
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
