import express from "express";
import {
  addLaptopDetails,
  deleteLaptopDetails,
  getAllLaptopDetails,
  getLaptopDetailsBySerialNumber,
  retireLaptop,
  updateLaptopDetails,
} from "../controllers/laptopDetailsController.js";
import {
  assignLaptop,
  getAllUsers,
  reassignLaptop,
  returnCurrentUser,
  updateCurrentUser,
} from "../controllers/laptopAssignmentController.js";
import {
  downloadLaptopQRCode,
  generateLaptopQRCode,
  generateLaptopQRCodeForAll,
} from "../controllers/laptopQrcodeController.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import {
  addModelToBrand,
  createBrand,
  deleteBrand,
  getAllBrands,
  getModelsByBrand,
  removeModelFromBrand,
} from "../controllers/laptopBrandController.js";

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
laptopRouter.get("/qr/all", generateLaptopQRCodeForAll);
laptopRouter.get(
  "/:serialNumber/qr/download",
  authMiddleware,
  downloadLaptopQRCode
);

// Brand and Model routes
laptopRouter.post("/brands", authMiddleware, createBrand);
laptopRouter.get("/all/brands", authMiddleware, getAllBrands);
laptopRouter.get("/brands/:brandName/models", authMiddleware, getModelsByBrand);
laptopRouter.post("/brands/:brandName/models", authMiddleware, addModelToBrand);
laptopRouter.delete(
  "/brands/:brandName/models/:model",
  authMiddleware,
  removeModelFromBrand
);
laptopRouter.delete("/brands/:brandName", authMiddleware, deleteBrand);
// laptopRouter.patch("/brands/:brandName", authMiddleware, updateBrandName);
export default laptopRouter;
