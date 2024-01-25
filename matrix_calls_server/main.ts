import express from "express";
import ws from "ws";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

type UserData = {
  name: string;
  email: string;
};

const connected_users: Record<string, [UserData, ws.WebSocket]> = {};

const app = express();

const my_server = app.listen(6969);

const ws_server = new ws.Server({
  noServer: true,
});



my_server.on("upgrade", (req, sock, head) => {
  ws_server.handleUpgrade(req, sock, head, (ws) => {
    ws.onmessage = (a) => {
      try {
        const data = JSON.parse(a.data.toString());
        if (data.auth) {
          const user_data = jwt.decode(data.auth) as jwt.JwtPayload;
          if (user_data?.name && user_data?.email) {
            connected_users[user_data.name] = [
              { name: user_data.name, email: user_data.email },
              ws,
            ];
            update_all_current();
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
  });
});


function handle_client(message: ws.MessageEvent) {

}
function update_all_current() { }
