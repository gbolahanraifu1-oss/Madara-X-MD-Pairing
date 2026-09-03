import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, consoleLogsTable } from "../lib/db";
import { getUserFromRequest } from "./auth";

const router: IRouter = Router();

// GET /console/logs
router.get("/console/logs", async (req, res): Promise<void> => {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const logs = await db
    .select()
    .from(consoleLogsTable)
    .where(eq(consoleLogsTable.userId, user.id))
    .orderBy(desc(consoleLogsTable.createdAt))
    .limit(200);

  res.json(
    logs.reverse().map((log) => ({
      id: log.id,
      level: log.level,
      message: log.message,
      timestamp: log.createdAt.toISOString(),
      sessionId: log.sessionId,
    }))
  );
});

// POST /console/clear
router.post("/console/clear", async (req, res): Promise<void> => {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  await db.delete(consoleLogsTable).where(eq(consoleLogsTable.userId, user.id));

  req.log.info({ userId: user.id }, "Console logs cleared");

  res.json({ message: "Console logs cleared" });
});

export default router;
