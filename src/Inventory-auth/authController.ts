import nodemailer from "nodemailer";
import { User } from "./authModel.js";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import crypto from "crypto";
import { ZodError } from "zod";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { loginSchema, userSchemaZod } from "./authValidation.js";
import mongoose from "mongoose";
import axios from "axios";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

// Interface for Google user data
interface GoogleUserData {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

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
    "7d") as SignOptions["expiresIn"];

  console.log(" Creating token with expiry:", expiresIn);

  const options: SignOptions = {
    expiresIn,
  };

  const token = jwt.sign({ _id }, secret, options);

  return token;
};

// ADD: Initiate Google OAuth
export const initiateGoogleAuth = (req: Request, res: Response) => {
  try {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      redirect_uri: `${process.env.SERVER_URL}/api/user/auth/google/callback`,
      response_type: "code",
      scope: "profile email",
      access_type: "offline",
      prompt: "consent",
    });

    res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  } catch (error) {
    console.error("Error initiating Google auth:", error);
    res.status(500).json({
      success: false,
      message: "Error initiating Google authentication",
    });
  }
};

// ADD: Google OAuth callback
export const googleAuthCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios.post<GoogleTokenResponse>(
      GOOGLE_TOKEN_URL,
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.SERVER_URL}/api/user/auth/google/callback`,
        grant_type: "authorization_code",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user info from Google
    const userResponse = await axios.get<GoogleUserData>(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id, email, name, picture } = userResponse.data;

    // Find user by email or googleId
    let user = await User.findOne({
      $or: [{ email }, { googleId: id }],
    });

    if (user) {
      // Existing user - link Google account if not already linked
      if (!user.googleId) {
        user.googleId = id;
        user.picture = picture;
        user.authProvider = user.password ? "both" : "google";
        await user.save();
      }
    } else {
      // Create new user with OAuth (no password needed)
      user = await User.create({
        email,
        googleId: id,
        name,
        picture,
        authProvider: "google",
        // password field is optional for OAuth users
      });
    }

    // Create JWT token using your existing createToken function
    const token = createToken((user._id as mongoose.Types.ObjectId).toString());

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  } catch (error: any) {
    console.error("OAuth callback error:", error.response?.data || error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

// ADD: Get current user (works with both local and OAuth users)
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // Assuming you have auth middleware that sets req.user
    const userId = (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findById(userId).select(
      "-password -resetPasswordToken -resetPasswordExpiry"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user",
    });
  }
};

// ADD: Unlink Google account (optional feature)
export const unlinkGoogleAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Can only unlink if user has a password (local auth)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "Cannot unlink Google account. Please set a password first.",
      });
    }

    user.googleId = undefined;
    user.authProvider = "local";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Google account unlinked successfully",
    });
  } catch (error) {
    console.error("Error unlinking Google account:", error);
    res.status(500).json({
      success: false,
      message: "Error unlinking Google account",
    });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = userSchemaZod.parse(req.body);
    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
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

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "Please sign in or register using Google",
      });
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
        name: user.name,
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
