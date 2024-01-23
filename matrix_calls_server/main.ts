import express from "express";
import ws from "ws";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

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
        console.log(data);
        if (data.auth && data.auth instanceof String) {
          console.log("haha bozo bozo");
          const user_data = jwt.decode(data.auth);
          console.log(user_data);
        }
      } catch (e) {
        console.error(e);
      }
    };
  });
});
