import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors";
import userRouter from "./Inventory-auth/authRoute.js";
import laptopRouter from "./inventory-laptops/routes/laptopsRoute.js";

dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());

app.use(
  cors({
    origin: [
      "https://it-asset-register-client.onrender.com", // your local frontend URL
      "http://localhost:5173",
    ],
  })
);

app.use("/api/user", userRouter);
app.use("/api/laptops", laptopRouter);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
