import { Request, Response } from "express";

export const signout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie("token",{path:"/"});
    res.status(200).json({ message: "Logged out successfully" });
  };