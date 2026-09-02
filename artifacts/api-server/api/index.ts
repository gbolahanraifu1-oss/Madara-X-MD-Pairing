import type { Request, Response } from "express";
import app from "../src/app";

/**
 * Vercel invokes this Express app as a request-scoped serverless function.
 * Rewrites normally preserve the /api prefix, but this also supports direct
 * function invocations where Vercel passes the path without it.
 */
export default function handler(req: Request, res: Response) {
  if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url === "/" ? "" : req.url}`;
  }

  return app(req, res);
}