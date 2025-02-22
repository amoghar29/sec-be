import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth";

export const check = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.userId) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
