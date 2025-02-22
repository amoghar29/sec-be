import { client } from "../../utils/db";
import { Request, Response } from "express";
import { generator } from "./totpGenerator";

export const generateAllTOTPs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).userId;

    // Get all secrets for the user
    const secretRecords = await client.tOTPSecret.findMany({
      where: {
        userId,
      },
    });

    if (!secretRecords.length) {
      res.status(404).json({
        success: false,
        data: null,
        error: "No TOTP secrets found",
      });
      return;
    }


      const totps = secretRecords.map((record) => {
      return generator(record);
    }
  )


    res.status(200).json({
      success: true,
      data: totps,
    });
  } catch (error) {
    console.error("Generate all TOTPs error:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: "Internal server error",
    });
  }
};
