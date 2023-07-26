import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws) {
  console.log("new client connected");

  ws.on("message", (data) => {
    // console.log(JSON.parse(data));
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(JSON.parse(data)));
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
