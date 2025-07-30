// server.js or index.ts
import next from "next";
import http from "http";
import { initDatabase } from "@/libs/database/init";
import { testDatabaseConnection } from "@/libs/database/testConnection";
import { startWebSocketServer } from "@/libs/socket/init";

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handler = app.getRequestHandler();

async function start() {
  await initDatabase();
  await testDatabaseConnection();
  startWebSocketServer(8086);

  const server = http.createServer((req, res) => handler(req, res));
  server.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
}

start();
