// app/lib/db.server.ts
import { PrismaClient } from "@prisma/client";

let db: PrismaClient;

declare global {
  var __db__: PrismaClient;
}

// Avoid multiple instances of Prisma Client in development
if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient();
  }
  db = global.__db__;
}

export { db };
