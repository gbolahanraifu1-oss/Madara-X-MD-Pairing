import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import pairingRouter from "./pairing";
import consoleRouter from "./console";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(pairingRouter);
router.use(consoleRouter);
router.use(contactRouter);

export default router;
