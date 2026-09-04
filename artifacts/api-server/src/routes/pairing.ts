import { Router } from "express";
import crypto from "node:crypto";
import { eq, and, desc } from "drizzle-orm";
import { db, pairingSessionsTable, consoleLogsTable } from "../lib/db.js";
import { getUserFromRequest } from "./auth.js";

const router = Router();

function generateSessionId(): string {
  return crypto.randomBytes(16).toString("hex");
}

function generatePairingCode(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generateQrData(phoneNumber: string, sessionId: string): string {
  const payload = `madara-xmd:${phoneNumber}:${sessionId}:${Date.now()}`;
  return Buffer.from(payload).toString("base64");
}

async function addConsoleLog(
  userId: number,
  sessionId: string | null,
  level: string,
  message: string
) {
  await db.insert(consoleLogsTable).values({ userId, sessionId, level, message });
}

const SIMULATED_CONNECTION_DELAY_MS = 8_000;

async function promoteReadySession(session: typeof pairingSessionsTable.$inferSelect) {
  const elapsed = Date.now() - session.createdAt.getTime();
  if (
    session.connected ||
    session.expiresAt.getTime() <= Date.now() ||
    elapsed < SIMULATED_CONNECTION_DELAY_MS
  ) {
    return session;
  }

  await db
    .update(pairingSessionsTable)
    .set({ connected: true, connectedAt: new Date(), lastSeen: new Date() })
    .where(
      and(
        eq(pairingSessionsTable.sessionId, session.sessionId),
        eq(pairingSessionsTable.connected, false),
      ),
    );

  await addConsoleLog(
    session.userId,
    session.sessionId,
    "success",
    `[ᴍᴀᴅᴀʀᴀ x-ᴍᴅ] Bot connected successfully to ${session.phoneNumber}!`,
  );
  await addConsoleLog(session.userId, session.sessionId, "info", `[SYSTEM] Initializing bot modules...`);
  await addConsoleLog(session.userId, session.sessionId, "info", `[PLUGIN] Loading command handlers...`);
  await addConsoleLog(session.userId, session.sessionId, "success", `[READY] ᴍᴀᴅᴀʀᴀ x-ᴍᴅ is online and ready!`);

  const [updatedSession] = await db
    .select()
    .from(pairingSessionsTable)
    .where(eq(pairingSessionsTable.sessionId, session.sessionId))
    .limit(1);

  return updatedSession ?? session;
}

// POST /pairing/request
router.post("/pairing/request", async (req, res): Promise<void> => {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { phoneNumber, method } = req.body;

  if (!phoneNumber || !method) {
    res.status(400).json({ error: "Phone number and method are required" });
    return;
  }

  if (!["qr", "code"].includes(method)) {
    res.status(400).json({ error: "Method must be 'qr' or 'code'" });
    return;
  }

  // Invalidate any existing sessions for this user
  await db
    .update(pairingSessionsTable)
    .set({ connected: false })
    .where(eq(pairingSessionsTable.userId, user.id));

  const sessionId = generateSessionId();
  const pairingCode = method === "code" ? generatePairingCode() : null;
  const qrData = method === "qr" ? generateQrData(phoneNumber, sessionId) : null;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await db.insert(pairingSessionsTable).values({
    userId: user.id,
    sessionId,
    phoneNumber,
    method,
    pairingCode,
    qrData,
    connected: false,
    expiresAt,
  });

  await addConsoleLog(user.id, sessionId, "info", `[ᴍᴀᴅᴀʀᴀ x-ᴍᴅ] Pairing session initiated for ${phoneNumber} via ${method}`);
  await addConsoleLog(user.id, sessionId, "debug", `[SESSION] ID: ${sessionId}`);

  if (method === "code") {
    await addConsoleLog(user.id, sessionId, "info", `[PAIRING] Code generated. Waiting for WhatsApp confirmation...`);
  } else {
    await addConsoleLog(user.id, sessionId, "info", `[QR] QR data generated. Scan within 5 minutes.`);
  }

  req.log.info({ userId: user.id, sessionId }, "Pairing session created");

  res.json({
    sessionId,
    pairingCode,
    qrData,
    expiresAt: expiresAt.toISOString(),
  });
});

// GET /pairing/status
router.get("/pairing/status", async (req, res): Promise<void> => {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  let [session] = await db
    .select()
    .from(pairingSessionsTable)
    .where(eq(pairingSessionsTable.userId, user.id))
    .orderBy(desc(pairingSessionsTable.createdAt))
    .limit(1);

  if (session && !session.connected) {
    session = await promoteReadySession(session);
  }

  if (!session || !session.connected) {
    res.json({
      connected: false,
      phoneNumber: session?.phoneNumber ?? null,
      sessionId: session?.sessionId ?? null,
      connectedAt: null,
      uptimeSeconds: null,
      lastSeen: null,
    });
    return;
  }

  // Update lastSeen
  await db
    .update(pairingSessionsTable)
    .set({ lastSeen: new Date() })
    .where(eq(pairingSessionsTable.sessionId, session.sessionId));

  const uptimeSeconds = session.connectedAt
    ? Math.floor((Date.now() - session.connectedAt.getTime()) / 1000)
    : null;

  res.json({
    connected: session.connected,
    phoneNumber: session.phoneNumber,
    sessionId: session.sessionId,
    connectedAt: session.connectedAt?.toISOString() ?? null,
    uptimeSeconds,
    lastSeen: new Date().toISOString(),
  });
});

// POST /pairing/disconnect
router.post("/pairing/disconnect", async (req, res): Promise<void> => {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [session] = await db
    .select()
    .from(pairingSessionsTable)
    .where(and(eq(pairingSessionsTable.userId, user.id), eq(pairingSessionsTable.connected, true)))
    .orderBy(desc(pairingSessionsTable.createdAt))
    .limit(1);

  if (session) {
    await db
      .update(pairingSessionsTable)
      .set({ connected: false })
      .where(eq(pairingSessionsTable.sessionId, session.sessionId));

    await addConsoleLog(user.id, session.sessionId, "warn", `[ᴍᴀᴅᴀʀᴀ x-ᴍᴅ] Bot disconnected from ${session.phoneNumber}`);
    await addConsoleLog(user.id, session.sessionId, "info", `[SYSTEM] Session terminated.`);
  }

  req.log.info({ userId: user.id }, "Bot disconnected");

  res.json({ message: "Bot disconnected successfully" });
});

// GET /pairing/stats
router.get("/pairing/stats", async (req, res): Promise<void> => {
  const allSessions = await db.select().from(pairingSessionsTable);
  const activeSessions = allSessions.filter((s) => s.connected);

  const uniqueUsers = new Set(allSessions.map((s) => s.userId));

  const avgUptime =
    activeSessions.length > 0
      ? Math.floor(
          activeSessions.reduce((acc, s) => {
            if (!s.connectedAt) return acc;
            return acc + (Date.now() - s.connectedAt.getTime()) / 1000;
          }, 0) / activeSessions.length
        )
      : 0;

  res.json({
    totalSessions: allSessions.length,
    activeSessions: activeSessions.length,
    totalUsers: uniqueUsers.size,
    averageUptimeSeconds: avgUptime,
  });
});

export default router;
