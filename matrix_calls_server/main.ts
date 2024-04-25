import express, { json } from "express";
import ws from "ws";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import https from 'https'
import fs from 'fs'
dotenv.config();

type UserData = {
    name: string;
    email: string;
};

const connected_users: Record<string, [UserData, ws.WebSocket]> = {};



const app = express();

const httpsServer = app.listen(6968);
// httpsServer.listen(6969);
const ws_server = new ws.Server({
    server: httpsServer
});
// .on("upgrade", (req, sock, head) => {
ws_server.on("connection", (ws) => {
    ws.onmessage = (a) => {
        try {
            const data = JSON.parse(a.data.toString());
            if (data.auth) {
                const user_data = jwt.decode(data.auth) as jwt.JwtPayload;
                if (user_data?.name && user_data?.email !== undefined) {
                    const user = { name: user_data.name, email: user_data.email };
                    connected_users[user_data.name] = [user, ws];
                    ws.onclose = (_event) => {
                        delete connected_users[user_data.name];
                    };
                    ws.onmessage = create_handle_client(user);
                    update_all_current();
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

});
// });
function create_handle_client(
    user_data: UserData,
): (data: ws.MessageEvent) => void {
    const handle_client = (message: ws.MessageEvent) => {
        // console.log(message.data);

        // rome-ignore lint/suspicious/noExplicitAny: <explanation>
        let data: Record<string, any> = {};

        try {
            data = JSON.parse(message.data.toString());
        } catch (_) { }
        if (!data) return;

        if (data?.message && data?.to) {
            const other = connected_users[data.to][1];
            other.send(
                JSON.stringify({
                    text: data.message,
                    sender: user_data.name,
                }),
            );
        } else if (data?.call_to && data.offer) {
            const other = connected_users[data.call_to][1];
            other.send(
                JSON.stringify({
                    call_from: user_data.name,
                    offer: data?.offer,
                }),
            );
        } else if (data?.call_to && data.answer) {
            const other = connected_users[data.call_to][1];
            other.send(
                JSON.stringify({
                    call_from: user_data.name,
                    answer: data.answer,
                }),
            );
        } else if (data?.call_to && data.icecandidate) {
            const other = connected_users[data.call_to][1];
            other.send(JSON.stringify({
                call_from: user_data.name,
                icecandidate: data.icecandidate
            }))
        }
        else if (data?.call_to && data.no === "no") {
            const other = connected_users[data.call_to][1];
            other.send(JSON.stringify({
                call_from: user_data.name,
                no: "no"
            }))
        }
    };
    return handle_client;
}
function update_all_current() {
    const username_to_data = Object.values(connected_users).map((val) => val[0]);
    const username_to_sockets = Object.fromEntries(
        Object.keys(connected_users).map((key) => [key, connected_users[key][1]]),
    );

    for (let index = 0; index < username_to_data.length; index++) {
        const user_data = username_to_data[index];

        const data = username_to_data.filter(
            (data) => data.name !== user_data.name,
        );

        username_to_sockets[user_data.name].send(
            JSON.stringify({
                liveUsers: data,
            }),
        );
    }
}

app.listen(6969)
