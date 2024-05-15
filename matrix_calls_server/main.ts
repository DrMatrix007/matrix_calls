import express from "express";
import ws from "ws";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

// Define the structure of user data
type UserData = {
  name: string;
  email: string;
};

class WebSocketServer {
  // Store the connected users as a map of username to [user data, WebSocket]
  private connectedUsers: Record<string, [UserData, ws.WebSocket]> = {};
  private wss: ws.Server;

  constructor(server: any) {
    // Create a new WebSocket server instance and attach it to the provided HTTP server
    this.wss = new ws.Server({ server });
    this.wss.on("connection", this.handleConnection.bind(this));
  }

  private handleConnection(ws: ws.WebSocket) {
    // Set up the onmessage event handler for each new WebSocket connection
    ws.onmessage = this.handleMessage.bind(this, ws);
  }

  private handleMessage(ws: ws.WebSocket, event: ws.MessageEvent) {
    try {
      const data = JSON.parse(event.data.toString());

      // Check if the message contains an authentication token
      if (data.auth) {
        const userData = jwt.decode(data.auth) as jwt.JwtPayload;

        // Verify and extract user data from the authentication token
        if (userData?.name && userData?.email !== undefined) {
          const user = { name: userData.name, email: userData.email };
          this.connectedUsers[userData.name] = [user, ws];

          // Set up event handlers for the WebSocket connection
          ws.onclose = () => {
            delete this.connectedUsers[userData.name];
          };

          ws.onmessage = this.createHandleClient(user);
          this.updateAllCurrent();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  private createHandleClient(userData: UserData): (event: ws.MessageEvent) => void {
    const handleClient = (event: ws.MessageEvent) => {
      let data: Record<string, any> = {};
      try {
        data = JSON.parse(event.data.toString());
      } catch (_) {}

      // Check if the message is empty
      if (!data) return;

      // Handle different types of messages
      if (data?.message && data?.to) {
        // Handle text messages
        const other = this.connectedUsers[data.to][1];
        other.send(
          JSON.stringify({
            text: data.message,
            sender: userData.name,
          })
        );
      } else if (data?.call_to && data.offer) {
        // Handle WebRTC call offers
        const other = this.connectedUsers[data.call_to][1];
        other.send(
          JSON.stringify({
            call_from: userData.name,
            offer: data?.offer,
          })
        );
      } else if (data?.call_to && data.answer) {
        // Handle WebRTC call answers
        const other = this.connectedUsers[data.call_to][1];
        other.send(
          JSON.stringify({
            call_from: userData.name,
            answer: data.answer,
          })
        );
      } else if (data?.call_to && data.icecandidate) {
        // Handle WebRTC ICE candidates
        const other = this.connectedUsers[data.call_to][1];
        other.send(
          JSON.stringify({
            call_from: userData.name,
            icecandidate: data.icecandidate,
          })
        );
      } else if (data?.call_to && data.no === "no") {
        // Handle call rejection
        const other = this.connectedUsers[data.call_to][1];
        other.send(
          JSON.stringify({
            call_from: userData.name,
            no: "no",
          })
        );
      }
    };

    return handleClient;
  }

  private updateAllCurrent() {
    // Prepare the list of connected users for broadcasting
    const usernameToData = Object.values(this.connectedUsers).map((val) => val[0]);
    const usernameToSockets = Object.fromEntries(
      Object.keys(this.connectedUsers).map((key) => [key, this.connectedUsers[key][1]])
    );

    // Broadcast the list of connected users to all clients
    for (let index = 0; index < usernameToData.length; index++) {
      const userData = usernameToData[index];
      const data = usernameToData.filter((data) => data.name !== userData.name);

      usernameToSockets[userData.name].send(
        JSON.stringify({
          liveUsers: data,
        })
      );
    }
  }
}

// Set up the Express server
const port = process.env.PORT || 3000;
const app = express();
const httpsServer = app.listen(port);
console.log("listening on ", port);

// Create a new instance of the WebSocketServer
const webSocketServer = new WebSocketServer(httpsServer);
