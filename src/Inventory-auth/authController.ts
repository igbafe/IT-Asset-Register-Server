import nodemailer from "nodemailer";
import { User } from "./authModel.js";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import crypto from "crypto";
import { ZodError } from "zod";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { loginSchema, userSchemaZod } from "./authValidation.js";
import mongoose from "mongoose";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);

const createToken = (_id: string) => {
  const secretEnv = process.env.JWT_SECRET;
  if (!secretEnv) throw new Error("JWT_SECRET is not set in environment");
  const secret: Secret = secretEnv;

  const expiresIn = (process.env.JWT_EXPIRES_IN ??
    "15m") as SignOptions["expiresIn"];

  console.log(" Creating token with expiry:", expiresIn);

  const options: SignOptions = {
    expiresIn,
  };

  const token = jwt.sign({ _id }, secret, options);

  return token;
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = userSchemaZod.parse(
      req.body
    );
    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const token = createToken(
      (newUser._id as mongoose.Types.ObjectId).toString()
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ success: false, errors: error.issues.map((e) => e.message) });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Error registering user" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // When creating the token:
    const token = createToken((user._id as mongoose.Types.ObjectId).toString());

    res.status(200).json({
      success: true,
      token,
      message: "Login successful",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ success: false, errors: error.issues.map((e) => e.message) });
    }
    res.status(500).json({ success: false, message: "Error logging in" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json({
      message: "Users retrieved successfully",
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error getting users", error: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `http://localhost:5000/api/auth/reset-password?token=${resetToken}&email=${email}`;

    // Send email
    await transporter.sendMail({
      from: "igbafes8@gmail.com",
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.`,
    });

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error sending password reset email",
    });
  }
};

// export const logoutUser = async (req: Request, res: Response) => {};
