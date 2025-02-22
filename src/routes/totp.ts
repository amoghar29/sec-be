import { Router } from "express";
import { addSecret } from "../controllers/totp/secret";
import { generateTOTP } from "../controllers/totp/totpGenerator";
import { generateAllTOTPs } from "../controllers/totp/generateAllOtps";

const router: Router = Router();

router.post("/secret", addSecret);
router.get("/generate/:serviceName", generateTOTP);
router.get("/generateAll", generateAllTOTPs);

export default router;
