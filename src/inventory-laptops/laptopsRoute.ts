import express from "express";
import {
  addLaptopDetails,
  deleteLaptopDetails,
  getAllLaptopDetails,
  getLaptopDetailsBySerialNumber,
  retireLaptop,
  updateLaptopDetails,
} from "./laptopDetailsController.js";
import {
  assignLaptop,
  getAllUsers,
  reassignLaptop,
  returnCurrentUser,
  updateCurrentUser,
} from "./laptopAssignmentController.js";
import {
  downloadLaptopQRCode,
  generateLaptopQRCode,
  generateLaptopQRCodeForAll,
} from "./laptopQrcodeController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const laptopRouter = express.Router();

// CRUD routes for laptop details
laptopRouter.post("/", authMiddleware, addLaptopDetails);
laptopRouter.get("/", authMiddleware, getAllLaptopDetails);
laptopRouter.get(
  "/:serialNumber",
  authMiddleware,
  getLaptopDetailsBySerialNumber
);
laptopRouter.put("/:serialNumber", authMiddleware, updateLaptopDetails);
laptopRouter.delete("/:serialNumber", authMiddleware, deleteLaptopDetails);
laptopRouter.put("/retire/:serialNumber", authMiddleware, retireLaptop);

//Assignment and user routes
laptopRouter.post("/:id/assign", authMiddleware, assignLaptop);
laptopRouter.put("/:id/reassign", authMiddleware, reassignLaptop);
laptopRouter.put("/:id/return", authMiddleware, returnCurrentUser);
laptopRouter.put("/:id/update-user", authMiddleware, updateCurrentUser);
laptopRouter.get("/:id/users", authMiddleware, getAllUsers);

// QR Code routes
laptopRouter.get("/:serialNumber/qr", authMiddleware, generateLaptopQRCode);
laptopRouter.get("/qr/all",  generateLaptopQRCodeForAll);
laptopRouter.get(
  "/:serialNumber/qr/download",
  authMiddleware,
  downloadLaptopQRCode
);

export default laptopRouter;
