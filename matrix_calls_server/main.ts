import express from 'express'
import ws from 'ws'
import dotenv from 'dotenv'

dotenv.config();

const JWT_KEY = process.env.JWT_SECRET;

const app = express();



const my_server = app.listen(6969);

const ws_server = new ws.Server({
  noServer: true,
});

my_server.on("upgrade", (req, sock, head) => {
  ws_server.handleUpgrade(req, sock, head, (ws) => {
    ws.on("message", a => {
      console.log(a.toString());
    });
  });
})



