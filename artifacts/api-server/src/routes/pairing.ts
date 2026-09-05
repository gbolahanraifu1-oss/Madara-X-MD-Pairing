import { Router } from "express";
import crypto from "node:crypto";
import { eq, and, desc } from "drizzle-orm";
import { db, pairingSessionsTable, consoleLogsTable } from "../lib/db.js";
import { getUserFromRequest } from "./auth.js";

const router = Router();

function generateSessionId(): string {
  return crypto.randomBytes(16).toString("hex");
}


async function addConsoleLog(
  userId: number,
  sessionId: string | null,
  level: string,
  message: string
) {
  await db.insert(consoleLogsTable).values({ userId, sessionId, level, message });
}

const BOT_URL = (process.env.BOT_URL || '').trim().replace(/\/+$/, '');

async function botRequest(path: string, init: any = {}): Promise<any> {
  if (!BOT_URL) {
    throw new Error('BOT_URL is not configured on the web API');
  }

  const response: any = await fetch(`${BOT_URL}${path}`, {
    ...init,
    headers: {
      accept: 'application/json',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
    signal: init.signal || AbortSignal.timeout(75_000),
  });
  const raw = await response.text();
  let body: any = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    body = { error: raw || 'Bot API returned an invalid response' };
  }

  if (!response.ok) {
    throw new Error(body.error || `Bot API returned HTTP ${response.status}`);
  }
  return body;
}

async function syncBotStatus(session: typeof pairingSessionsTable.$inferSelect) {
  const botStatus = await botRequest(`/status?phone=${encodeURIComponent(session.phoneNumber)}`);
  const connected = Boolean(botStatus.connected);

  if (connected === session.connected) return session;

  await db
    .update(pairingSessionsTable)
    .set({
      connected,
      connectedAt: connected ? new Date() : null,
      lastSeen: connected ? new Date() : session.lastSeen,
    })
    .where(eq(pairingSessionsTable.sessionId, session.sessionId));

  await addConsoleLog(
    session.userId,
    session.sessionId,
    connected ? 'success' : 'warn',
    connected
      ? `[ᴍᴀᴅᴀʀᴀ x-ᴍᴅ] Bot connected successfully to ${session.phoneNumber}!`
      : `[ᴍᴀᴅᴀʀᴀ x-ᴍᴅ] Bot disconnected from ${session.phoneNumber}`,
  );

  const [updatedSession] = await db
    .select()
    .from(pairingSessionsTable)
    .where(eq(pairingSessionsTable.sessionId, session.sessionId))
    .limit(1);

  return updatedSession ?? session;
}

// POST /pairing/request
router.post('/pairing/request', async (req: any, res: any): Promise<void> => {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { phoneNumber, method } = req.body;
  const phone = String(phoneNumber || '').replace(/[^0-9]/g, '');

  if (!phone || !method) {
    res.status(400).json({ error: 'Phone number and method are required' });
    return;
  }

  if (phone.length < 7 || phone.length > 15) {
    res.status(400).json({ error: 'Use an international phone number with country code' });
    return;
  }

  if (method !== 'code') {
    res.status(400).json({ error: 'This VPS bot currently supports 8-digit pairing code only' });
    return;
  }

  let botPair: any;
  try {
    botPair = await botRequest(`/pair?phone=${encodeURIComponent(phone)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The VPS bot could not create a pairing code';
    res.status(502).json({ error: message });
    return;
  }

  const pairingCode = String(botPair.code || '').toUpperCase();
  if (!pairingCode) {
    res.status(502).json({ error: 'The VPS bot returned no pairing code' });
    return;
  }

  await db
    .update(pairingSessionsTable)
    .set({ connected: false })
    .where(eq(pairingSessionsTable.userId, user.id));

  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db.insert(pairingSessionsTable).values({
    userId: user.id,
    sessionId,
    phoneNumber: phone,
    method: 'code',
    pairingCode,
    qrData: null,
    connected: false,
    expiresAt,
  });

  await addConsoleLog(user.id, sessionId, 'info', `[ᴍᴀᴅᴀʀᴀ x-ᴍᴅ] Pairing code requested from VPS for ${phone}`);
  await addConsoleLog(user.id, sessionId, 'info', `[PAIRING] Code received: ${pairingCode}`);

  req.log.info({ userId: user.id, sessionId, phone }, 'VPS pairing session created');

  res.json({
    sessionId,
    pairingCode,
    qrData: null,
    expiresAt: expiresAt.toISOString(),
  });
});

// GET /pairing/status
router.get('/pairing/status', async (req: any, res: any): Promise<void> => {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  let [session] = await db
    .select()
    .from(pairingSessionsTable)
    .where(eq(pairingSessionsTable.userId, user.id))
    .orderBy(desc(pairingSessionsTable.createdAt))
    .limit(1);

  if (!session) {
    res.json({ connected: false, phoneNumber: null, sessionId: null, connectedAt: null, uptimeSeconds: null, lastSeen: null });
    return;
  }

  try {
    session = await syncBotStatus(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reach the VPS bot';
    res.status(502).json({ error: message });
    return;
  }

  if (!session.connected) {
    res.json({
      connected: false,
      phoneNumber: session.phoneNumber,
      sessionId: session.sessionId,
      connectedAt: null,
      uptimeSeconds: null,
      lastSeen: session.lastSeen?.toISOString() ?? null,
    });
    return;
  }

  await db
    .update(pairingSessionsTable)
    .set({ lastSeen: new Date() })
    .where(eq(pairingSessionsTable.sessionId, session.sessionId));

  const uptimeSeconds = session.connectedAt
    ? Math.floor((Date.now() - session.connectedAt.getTime()) / 1000)
    : null;

  res.json({
    connected: true,
    phoneNumber: session.phoneNumber,
    sessionId: session.sessionId,
    connectedAt: session.connectedAt?.toISOString() ?? null,
    uptimeSeconds,
    lastSeen: new Date().toISOString(),
  });
});

// POST /pairing/disconnect
router.post('/pairing/disconnect', async (req: any, res: any): Promise<void> => {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const [session] = await db
    .select()
    .from(pairingSessionsTable)
    .where(eq(pairingSessionsTable.userId, user.id))
    .orderBy(desc(pairingSessionsTable.createdAt))
    .limit(1);

  if (session) {
    try {
      await botRequest(`/session/clear?phone=${encodeURIComponent(session.phoneNumber)}`, { method: 'POST' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reach the VPS bot';
      res.status(502).json({ error: message });
      return;
    }

    await db
      .update(pairingSessionsTable)
      .set({ connected: false, connectedAt: null })
      .where(eq(pairingSessionsTable.sessionId, session.sessionId));

    await addConsoleLog(user.id, session.sessionId, 'warn', `[ᴍᴀᴅᴀʀᴀ x-ᴍᴅ] Bot disconnected from ${session.phoneNumber}`);
    await addConsoleLog(user.id, session.sessionId, 'info', '[SYSTEM] Session terminated.');
  }

  req.log.info({ userId: user.id }, 'Bot disconnected');
  res.json({ message: 'Bot disconnected successfully' });
});

// GET /pairing/stats
router.get("/pairing/stats", async (req: any, res: any): Promise<void> => {
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