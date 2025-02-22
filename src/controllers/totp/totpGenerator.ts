import { Request, Response } from "express";
import { client } from "../../utils/db";
import { TOTPResponse } from "../../types/totp.types";
import { authenticator } from "otplib";
import * as crypto from "crypto";
import exp from "constants";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;

export const generator = (secretRecord :any) => {

  const serviceName: string = secretRecord.serviceName;
  // Decrypt the stored secret
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    Buffer.from(secretRecord.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(secretRecord.authTag, "hex"));

  let decryptedSecret = decipher.update(
    secretRecord.encryptedSecret,
    "hex",
    "utf8"
  );
  decryptedSecret += decipher.final("utf8");

  // Generate TOTP using otplib with RFC3548 base32 encoded secret
  const token = authenticator.generate(decryptedSecret);

  // Get remaining time in the current window
  const remainingTime = authenticator.timeRemaining();
  const validUntil = new Date(Date.now() + remainingTime * 1000);

  return {
    token,
    validUntil,
    serviceName,
  }
};

export const generateTOTP = async (
  req: Request,
  res: Response<TOTPResponse>
): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { serviceName } = req.params;

    const secretRecord = await client.tOTPSecret.findFirst({
      where: {
        userId,
        serviceName,
      },
    });

    if (!secretRecord) {
      res.status(404).json({
        success: false,
        data: null,
        error: "Secret key not found",
      });
      return;
    }

    const { token, validUntil } = generator(secretRecord);

    res.status(200).json({
      success: true,
      data: {
        code: token,
        validUntil,
      },
    });
  } catch (error) {
    console.error("Generate TOTP error:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: "Internal server error",
    });
  }
};
