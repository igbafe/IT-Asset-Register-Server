import nodemailer from "nodemailer";
import { User } from "./authModel.js";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import crypto from "crypto";
import { z, ZodError } from "zod";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { loginSchema, otpSchema, userSchemaZod } from "./authValidation.js";
import mongoose from "mongoose";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "igbafes8@gmail.com",
    pass: "docsvqmjzoobabsc",
  },
});

const createToken = (_id: string) => {
  const secretEnv = process.env.JWT_SECRET;
  if (!secretEnv) throw new Error("JWT_SECRET is not set in environment");
  const secret: Secret = secretEnv;

  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];
  
  console.log("🔑 Creating token with expiry:", expiresIn);

  const options: SignOptions = {
    expiresIn,
  };

  const token = jwt.sign({ _id }, secret, options);
  
  // Decode to verify expiry was set
  const decoded = jwt.decode(token) as any;
  console.log("📅 Token created:");
  console.log("   - Issued at (iat):", new Date(decoded.iat * 1000).toISOString());
  console.log("   - Expires at (exp):", new Date(decoded.exp * 1000).toISOString());
  console.log("   - Time until expiry:", Math.floor((decoded.exp - decoded.iat) / 60), "minutes");

  return token;
};

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = userSchemaZod.parse(req.body);
    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 60 * 10000); // 1 min

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Hash OTP before saving (security)
    const hashedOTP = await bcrypt.hash(otp, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      otp: hashedOTP,
      otpExpiry,
      isVerified: false,
    });
    try {
      await transporter.sendMail({
        from: "igbafes8@gmail.com",
        to: email,
        subject: "OTP Verification",
        text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
      });
    } catch (emailError) {
      // Rollback user creation if email fails
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email, please try again",
      });
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify OTP.",
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

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = otpSchema.parse(req.body);
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Check OTP validity
    const isOTPValid = await bcrypt.compare(otp, user.otp || "");
    if (
      !isOTPValid ||
      !user.otpExpiry || // Check if otpExpiry is undefined
      user.otpExpiry < new Date()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = createToken((user._id as mongoose.Types.ObjectId).toString());

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now login.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ success: false, errors: error.issues.map((e) => e.message) });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Hash new OTP
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpiry = otpExpiry;
    await user.save();

    try {
      await transporter.sendMail({
        from: "igbafes8@gmail.com",
        to: email,
        subject: "OTP Verification (Resent)",
        text: `Your new OTP is: ${otp}. It is valid for 10 minutes.`,
      });
    } catch (emailError) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email, please try again",
      });
    }

    res.status(200).json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error resending OTP" });
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

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email not verified. Please verify OTP.",
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
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
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
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email not verified. Please verify OTP first.",
      });
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
