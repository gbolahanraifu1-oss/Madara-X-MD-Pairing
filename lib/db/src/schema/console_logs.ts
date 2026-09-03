import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const consoleLogsTable = pgTable("console_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: text("session_id"),
  level: text("level").notNull().default("info"), // info | warn | error | success | debug
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConsoleLogSchema = createInsertSchema(consoleLogsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertConsoleLog = z.infer<typeof insertConsoleLogSchema>;
export type ConsoleLog = typeof consoleLogsTable.$inferSelect;
