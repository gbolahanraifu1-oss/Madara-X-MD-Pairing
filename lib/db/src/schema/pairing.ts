import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pairingSessionsTable = pgTable("pairing_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: text("session_id").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  method: text("method").notNull().default("code"), // "qr" | "code"
  pairingCode: text("pairing_code"),
  qrData: text("qr_data"),
  connected: boolean("connected").notNull().default(false),
  connectedAt: timestamp("connected_at", { withTimezone: true }),
  lastSeen: timestamp("last_seen", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPairingSessionSchema = createInsertSchema(pairingSessionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPairingSession = z.infer<typeof insertPairingSessionSchema>;
export type PairingSession = typeof pairingSessionsTable.$inferSelect;
