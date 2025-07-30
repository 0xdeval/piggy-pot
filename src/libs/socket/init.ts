import { WebSocketServer, WebSocket } from "ws";
import { logger } from "@/utils/logger";

let wss: WebSocketServer;
const clients = new Set<WebSocket>();

export function startWebSocketServer(port = 8080) {
  wss = new WebSocketServer({ port });

  wss.on("connection", (ws) => {
    clients.add(ws);

    broadcastEvent("CONNECTED");

    logger.info("[WS] New client connected");

    ws.on("close", () => {
      broadcastEvent("DISCONNECTED");

      clients.delete(ws);
      logger.info("[WS] Client disconnected");
    });
  });

  logger.info(`[WS] WebSocket server started on ws://localhost:${port}`);
}

export function broadcastEvent(event: string, payload?: any) {
  const message = JSON.stringify({ event, payload });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}
