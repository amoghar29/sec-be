import { client } from "../../utils/db";
import { Request, Response } from "express";
import { SignupRequest, AuthResponse } from "../../types/auth.types";
import { signupPayloadSchema } from "../../validations/auth.validations";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;
const saltRounds = 10;

export const signup = async (
  req: Request<SignupRequest>,
  res: Response<AuthResponse>
): Promise<void> => {
  try {
    // Validate the request body
    const { error, value } = signupPayloadSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: error.message,
        data: null,
      });
      return;
    }
    // Check if the email is already used
    const isEmailAlreadyUsed = await client.user.findUnique({
      where: { email: value.email },
    });
    if (isEmailAlreadyUsed) {
      res.status(409).json({
        success: false,
        error: "Email already used",
        data: null,
      });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(value.password, saltRounds);

    // Create the user
    const user: User = await client.user.create({
      data: {
        email: value.email,
        password: hashedPassword,
      },
    });
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: "HS256",
      }
    );
    res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
        path: "/",
      })
      .json({
        success: true,
        message: "User signed up successfully",
        data: { token },
      });
  } catch (error) {
    // handle any errors that occur during the process
    res.status(500).json({
      success: false,
      error: "Internal server error",
      data: null,
    });
  }
};
