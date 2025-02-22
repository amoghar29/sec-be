import { Request, Response } from "express";
import { client } from "../../utils/db";
import { AddSecretRequest } from "../../types/totp.types";
import { addSecretSchema } from "../../validations/totp.validations";
import { authenticator } from "otplib";
import * as crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;

export const addSecret = async (
  req: Request<AddSecretRequest>,
  res: Response
) => {
  const { error, value } = addSecretSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      data: null,
      error: error.message,
    });
    return;
  }

  const userId = (req as any).userId;

  try {
    const secret = value.secretKey.split(" ").join("");

    // Validate the secret is base32 encoded
    try {
      authenticator.decode(secret);
    } catch (error) {
      res.status(400).json({
        success: false,
        data: null,
        error: "Invalid base32 encoded secret key",
      });
      return;
    }

    // Encrypt the secret before storing
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY, "hex"),
      iv
    );

    let encryptedSecret = cipher.update(secret, "utf8", "hex");
    encryptedSecret += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    await client.tOTPSecret.create({
      data: {
        userId,
        serviceName: value.serviceName,
        encryptedSecret: encryptedSecret,
        iv: iv.toString("hex"),
        authTag: authTag.toString("hex"),
      },
    });

    const otpauth = authenticator.keyuri(userId, value.serviceName, secret);

    res.status(201).json({
      success: true,
      message: "Secret key stored successfully",
      data: {
        otpauthUrl: otpauth,
      },
    });
  } catch (error) {
    console.error("Error adding secret: ", error);
    res.status(500).json({
      success: false,
      data: null,
      error: "Internal server error",
    });
  }
};

