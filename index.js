import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use("/uploads", express.static(__dirname + "/uploads"));

app.listen(4040, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("server running at port 4040");
});

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws) {
  console.log("new client connected");

  ws.on("message", (data) => {
    const messageData = JSON.parse(data);
    const { sender_id, message, file } = messageData;
    let filePath = "";

    if (file) {
      const parts = file.name.split(".");
      const ext = parts[parts.length - 1];
      const filename = Date.now() + "." + ext;
      if (!fs.existsSync("uploads")) {
        fs.mkdirSync("uploads");
      }
      const path = __dirname + "/uploads/" + filename;
      const bufferData = new Buffer.from(file.data.split(",")[1], "base64");
      fs.writeFile(path, bufferData, () => {
        console.log("file saved:" + path);
      });
      filePath = "https://chat-cpwa.onrender.com" + "/uploads/" + filename;
    }

    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({ sender_id, message, type: file.type, filePath })
        );
      }
    });
  });

  ws.on("close", () => {
    console.log("client has disconnected");
  });

  ws.onerror = function () {
    console.log("some error accoured");
  };
});
