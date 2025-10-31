import express from "express";
import {
  assignLaptop,
  getAllLaptops,
  getLaptopBySerailNumber,
  reassignLaptop,
  retireAssignment,
  updateLaptop,
} from "../inventory-laptopAssignments/laptopAssignmentController.ts";

const assignmentRouter = express.Router();

assignmentRouter.post("/", assignLaptop);
assignmentRouter.post("/reassign/:serialNumber", reassignLaptop);
assignmentRouter.put("/:_id", updateLaptop);
assignmentRouter.get("/:serialNumber", getLaptopBySerailNumber);
assignmentRouter.get("/", getAllLaptops);
assignmentRouter.put("/retire/:systemName",retireAssignment);

export default assignmentRouter;
