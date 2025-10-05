import express from "express";
import {
  assignLaptop,
  getAllLaptops,
  getLaptopBySerailNumber,
  reassignLaptop,
  updateLaptop,
} from "../inventory-laptopAssignments/laptopAssignmentController.ts";

const assignmentRouter = express.Router();

assignmentRouter.post("/", assignLaptop);
assignmentRouter.post("/:serialNumber", reassignLaptop);
assignmentRouter.put("/:_id", updateLaptop);
assignmentRouter.get("/:serialNumber", getLaptopBySerailNumber);
assignmentRouter.get("/", getAllLaptops);

export default assignmentRouter;
