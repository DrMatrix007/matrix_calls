import { writable } from 'svelte/store';

const messageStore = writable('');

const socket = new WebSocket('wss://localhost:6969');

// Connection opened
socket.addEventListener('open', function(_event) {
  console.log("It's open");
});

// Listen for messages
socket.addEventListener('message', function(event) {
  messageStore.set(event.data);
});

export const sendMessage = (message: string) => {
  if (socket.readyState <= 1) {
    socket.send(message);
  }
}


export const subscribe = messageStore.subscribe;
