import express from "express";
import {
  forgotPassword,
  getAllUsers,
  loginUser,
  registerUser,
} from "../Inventory-auth/authController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/", getAllUsers);
userRouter.post("/forgot-password", forgotPassword);

export default userRouter;
