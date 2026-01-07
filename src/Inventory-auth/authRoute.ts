import express from "express";
import {
  forgotPassword,
  getAllUsers,
  getCurrentUser,
  googleAuthCallback,
  initiateGoogleAuth,
  loginUser,
  registerUser,
  unlinkGoogleAccount,
} from "../Inventory-auth/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/", getAllUsers);
userRouter.post("/forgot-password", forgotPassword);

// NEW: OAuth routes
userRouter.get("/google", initiateGoogleAuth);
userRouter.get("/auth/google/callback", googleAuthCallback);

// NEW: Protected routes (add your auth middleware if you have one)
userRouter.get("/me", getCurrentUser); // Add 'protect' middleware if you have it
userRouter.post("/unlink-google", unlinkGoogleAccount); // Add 'protect' middleware

export default userRouter;
