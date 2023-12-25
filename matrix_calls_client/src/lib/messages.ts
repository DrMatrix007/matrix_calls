import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

class ServerSocket {
  messageStore: Writable<string>
  socket: WebSocket

  constructor() {
    this.messageStore = writable('');
    this.socket = new WebSocket('ws://localhost:6969');

    this.socket?.addEventListener('open', (_event) => {
      console.log("It's open");
    });

    this.socket?.addEventListener('message', (event) => {
      this.messageStore.set(event.data);
    });
  }
  sendMessage(message: string) {
    if (this.socket && this.socket.readyState <= 1) {
      this.socket.send(message);
    }
  }

  get subscribe() {
    return this.messageStore.subscribe;
  }
}

export default ServerSocket;
