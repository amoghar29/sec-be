import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { signinPayloadSchema } from "../../validations/auth.validations";
import { SigninRequest, AuthResponse } from "../../types/auth.types";
import { client } from "../../utils/db";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export const signin = async (
  req: Request<SigninRequest>,
  res: Response<AuthResponse>
): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = signinPayloadSchema.validate(req.body);

    if (error) {
      res.status(400).json({
        success: false,
        data: null,
        error: error.message,
      });
    }

    // Find user with email
    const user = await client.user.findUnique({
      where: { email: value.email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        data: null,
        error: "User does not exist",
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(value.password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        data: null,
        error: "Invalid password",
      });
      return;
    }

    // Generate JWT token
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

    // Set secure cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      expires: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      path: "/",
    };

    // Set cookie and send response
    res.cookie("token", token, cookieOptions).status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: "Internal server error",
    });
  }
};
