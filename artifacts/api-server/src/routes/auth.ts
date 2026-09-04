import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq, and, gt } from "drizzle-orm";
import { db, usersTable, sessionsTable } from "../lib/db.js";
import { logger } from "../lib/logger.js";

const router = Router();

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function getUserFromRequest(req: any): Promise<{ id: number; email: string; username: string; createdAt: Date } | null> {
  const authHeader = req.headers["authorization"] as string | undefined;
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) return null;

  const now = new Date();
  const [session] = await db
    .select({ userId: sessionsTable.userId })
    .from(sessionsTable)
    .where(and(eq(sessionsTable.token, token), gt(sessionsTable.expiresAt, now)));

  if (!session) return null;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.userId));

  return user || null;
}

// POST /auth/register
router.post("/auth/register", async (req: any, res: any): Promise<void> => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    res.status(400).json({ error: "Email, username, and password are required" });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  if (username.length < 3) {
    res.status(400).json({ error: "Username must be at least 3 characters" });
    return;
  }

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const [existingUsername] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (existingUsername) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(usersTable)
    .values({
      email: email.toLowerCase(),
      username,
      passwordHash,
    })
    .returning();

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(sessionsTable).values({
    userId: user.id,
    token,
    expiresAt,
  });

  req.log.info({ userId: user.id }, "User registered");

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
    },
    message: "Registration successful",
    token,
  });
});

// POST /auth/login
router.post("/auth/login", async (req: any, res: any): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(sessionsTable).values({
    userId: user.id,
    token,
    expiresAt,
  });

  req.log.info({ userId: user.id }, "User logged in");

  res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
    },
    message: "Login successful",
    token,
  });
});

// POST /auth/logout
router.post("/auth/logout", async (req: any, res: any): Promise<void> => {
  const authHeader = req.headers["authorization"] as string | undefined;
  const token = authHeader?.replace("Bearer ", "").trim();

  if (token) {
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  }

  res.json({ message: "Logged out successfully" });
});

// GET /auth/me
router.get("/auth/me", async (req: any, res: any): Promise<void> => {
  const user = await getUserFromRequest(req);

  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt.toISOString(),
  });
});

// POST /auth/forgot-password
router.post("/auth/forgot-password", async (req: any, res: any): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (user) {
    const resetToken = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db
      .update(usersTable)
      .set({ resetToken, resetTokenExpiresAt: expiresAt })
      .where(eq(usersTable.id, user.id));

    logger.info({ userId: user.id }, "Password reset token generated");
  }

  res.json({ message: "If an account exists with that email, a reset link has been sent." });
});

// POST /auth/reset-password
router.post("/auth/reset-password", async (req: any, res: any): Promise<void> => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400).json({ error: "Token and new password are required" });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const now = new Date();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.resetToken, token), gt(usersTable.resetTokenExpiresAt!, now)));

  if (!user) {
    res.status(400).json({ error: "Invalid or expired reset token" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db
    .update(usersTable)
    .set({ passwordHash, resetToken: null, resetTokenExpiresAt: null })
    .where(eq(usersTable.id, user.id));

  req.log.info({ userId: user.id }, "Password reset successful");

  res.json({ message: "Password reset successfully. You can now log in." });
});

export { getUserFromRequest };
export default router;