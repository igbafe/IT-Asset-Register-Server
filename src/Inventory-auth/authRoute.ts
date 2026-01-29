import express from "express";
import {
  forgotPassword,
  getAllUsers,
  getProfile,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
} from "../Inventory-auth/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/", getAllUsers);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/refresh", refreshToken);
userRouter.post("/logout", authMiddleware, logoutUser);
userRouter.get("/profile", authMiddleware, getProfile);

export default userRouter;
