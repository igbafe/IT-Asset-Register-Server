import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.ts";
import cors from "cors";
import userRouter from "./Inventory-auth/authRoute.ts";
import assignmentRouter from "./inventory-laptopAssignments/laptopAssignmentRoute.ts";
import laptopDetailsRouter from "./inventory-laptopDetails/laptopDetailsRoute.ts";

dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173", // your local frontend URL
    ],
  })
);

app.use("/api/user", userRouter);
app.use("/api/laptopDetails", laptopDetailsRouter);
app.use("/api/laptopAssignment", assignmentRouter);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
