import { Router } from "express";
import { signup } from "../controllers/auth/signup";
import { signin } from "../controllers/auth/signin";
import { signout } from "../controllers/auth/signout";
import { check } from "../controllers/auth/check";
import { authMiddleware } from "../middlewares/auth";

const router: Router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", signout);
router.get("/check", authMiddleware, check);

export default router;
