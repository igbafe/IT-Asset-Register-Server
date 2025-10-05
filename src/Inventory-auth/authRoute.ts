import express from "express";
import {
  forgotPassword,
  getAllUsers,
  loginUser,
  registerUser,
  resendOTP,
  verifyOTP,
} from "../Inventory-auth/authController.ts";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/verify-otp", verifyOTP);
userRouter.post("/resend-otp", resendOTP);
userRouter.post("/login", loginUser);
userRouter.get("/", getAllUsers);
userRouter.post("/forgot-password", forgotPassword);

export default userRouter;
