import type { Request, Response } from "express";
import app from "../artifacts/api-server/src/app";

export default function handler(req: Request, res: Response) {
  if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url === "/" ? "" : req.url}`;
  }

  return app(req, res);
}
