import express from "express";
import {
  addLaptopDetails,
  deleteLaptopDetails,
  getAllLaptopDetails,
  getLaptopDetailsBySerialNumber,
  retireLaptop,
  updateLaptopDetails,
} from "./laptopDetailsController.js";

const laptopDetailsRouter = express.Router();

laptopDetailsRouter.post("/", addLaptopDetails);
laptopDetailsRouter.get("/", getAllLaptopDetails);
laptopDetailsRouter.get("/:serialNumber", getLaptopDetailsBySerialNumber);
laptopDetailsRouter.put("/:serialNumber", updateLaptopDetails);
laptopDetailsRouter.delete("/:serialNumber", deleteLaptopDetails);
laptopDetailsRouter.put("/retire/:serialNumber", retireLaptop);

export default laptopDetailsRouter;
