import { WebSocketServer, WebSocket } from "ws";

let wss: WebSocketServer;
const clients = new Set<WebSocket>();

export function startWebSocketServer(port = 8080) {
  wss = new WebSocketServer({ port });

  wss.on("connection", (ws) => {
    clients.add(ws);

    broadcastEvent("CONNECTED");

    console.log("[WS] New client connected");

    ws.on("close", () => {
      broadcastEvent("DISCONNECTED");

      clients.delete(ws);
      console.log("[WS] Client disconnected");
    });
  });

  console.log(`[WS] WebSocket server started on ws://localhost:${port}`);
}

export function broadcastEvent(event: string, payload?: any) {
  const message = JSON.stringify({ event, payload });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}
