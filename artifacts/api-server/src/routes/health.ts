import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/healthz", (_req: Request, res: Response) => {

export default router;
