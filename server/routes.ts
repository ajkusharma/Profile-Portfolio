import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerContactRoutes } from "./contact";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  registerContactRoutes(app);

  return httpServer;
}
