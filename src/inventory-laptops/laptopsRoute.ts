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

const laptopRouter = express.Router();

// CRUD routes for laptop details
laptopRouter.post("/", addLaptopDetails);
laptopRouter.get("/", getAllLaptopDetails);
laptopRouter.get("/:serialNumber", getLaptopDetailsBySerialNumber);
laptopRouter.put("/:serialNumber", updateLaptopDetails);
laptopRouter.delete("/:serialNumber", deleteLaptopDetails);
laptopRouter.put("/retire/:serialNumber", retireLaptop);

//Assignment and user routes
laptopRouter.post("/:id/assign", assignLaptop);
laptopRouter.put("/:id/reassign", reassignLaptop);
laptopRouter.put("/:id/return", returnCurrentUser);
laptopRouter.put("/:id/update-user", updateCurrentUser);
laptopRouter.get("/:id/users", getAllUsers);

export default laptopRouter;
