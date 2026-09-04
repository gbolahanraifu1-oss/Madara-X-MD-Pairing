import { Router, type RequestHandler } from "express";

const router = Router();

const getHealth: RequestHandler = (_req, res) => {
  res.json({ status: "ok" });
};

router.get("/healthz", getHealth);

export default router;