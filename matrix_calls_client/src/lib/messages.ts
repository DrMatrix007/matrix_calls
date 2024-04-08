import { writable, type Writable } from "svelte/store";

class ServerSocket {
  messageStore: Writable<string>;
  socket: WebSocket;

  constructor(jwt: string) {
    this.messageStore = writable("");
    this.socket = new WebSocket("wss://localhost:6969");
    // this.socket = new WebSocket("wss://192.168.88.81:6969");

    this.socket?.addEventListener("open", (_event) => {
      this.socket.send(
        JSON.stringify({
          auth: jwt,
        }),
      );
    });

    this.socket?.addEventListener("message", (event) => {
      this.messageStore.set(event.data);
    });
  }

  sendMessage(message: string | object) {
    if (this.socket && this.socket.readyState <= 1) {
      this.socket.send(JSON.stringify(message));
    }
  }

  get subscribe() {
    return this.messageStore.subscribe;
  }
}

export default ServerSocket;
