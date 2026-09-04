import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import pairingRouter from "./pairing.js";
import consoleRouter from "./console.js";
import contactRouter from "./contact.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(pairingRouter);
router.use(consoleRouter);
router.use(contactRouter);

export default router;
