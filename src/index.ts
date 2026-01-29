import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors";
import userRouter from "./Inventory-auth/authRoute.js";
import laptopRouter from "./inventory-laptops/routes/laptopsRoute.js";
import cookieParser from "cookie-parser";

dotenv.config({ path: "./.env" });

const app = express();
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "https://it-asset-register-client.onrender.com", // your local frontend URL
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/user", userRouter);
app.use("/api/laptops", laptopRouter);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  },
);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
