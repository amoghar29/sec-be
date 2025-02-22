import { Router } from "express";
import totprouter from "./totp";
import authRouter from "./auth";
import { authMiddleware } from "../middlewares/auth";
const router: Router = Router();

router.use("/totp", authMiddleware, totprouter);
router.use("/auth", authRouter);

export default router;
