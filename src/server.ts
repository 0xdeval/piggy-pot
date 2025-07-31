import next from "next";
import { createServer } from "http";
import { parse } from "url";
import { WebSocketServer, WebSocket } from "ws";
import { logger } from "@/utils/logger";
import { startWebSocketServer } from "./libs/socket/init";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  startWebSocketServer(8086);

  server.listen(port, () => {
    console.log(`> Server listening at http://localhost:${port}`);
    logger.info(`[WS] WebSocket path ws://localhost:${port}`);
  });
});
