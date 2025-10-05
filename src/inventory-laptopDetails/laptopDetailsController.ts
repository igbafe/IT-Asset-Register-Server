import type { Request, Response } from "express";
import laptopDetailsModel from "./laptopDetailsModel.ts";
import { laptopDetailsSchema } from "./laptopDetailsValidation.ts";

export const addLaptopDetails = async (req: Request, res: Response) => {
  try {
    const laptopDetails = laptopDetailsSchema.parse(req.body);

    // check if laptop with the same serial number already exists
    const existingLaptop = await laptopDetailsModel.findOne({
      serialNumber: laptopDetails.serialNumber,
    });
    if (existingLaptop) {
      return res.status(400).json({
        success: false,
        message: "Laptop with this serial number already exists",
      });
    }
    const newLaptopDetails = new laptopDetailsModel(laptopDetails);
    await newLaptopDetails.save();
    res.status(201).json({
      message: "Laptop details added successfully",
      laptop: newLaptopDetails,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ errors: error.errors });
    }
    res
      .status(500)
      .json({ message: "Error adding laptop details", error: error.message });
  }
};

export const getLaptopDetailsBySerialNumber = async (
  req: Request,
  res: Response
) => {
  try {
    const { serialNumber } = req.params;
    const laptop = await laptopDetailsModel.findOne({ serialNumber });

    if (!laptop) {
      return res.status(404).json({ message: "Laptop not found" });
    }

    res.status(200).json({
      message: "Laptop retrieved successfully",
      laptop,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error getting laptop details by serial number",
      error: error.message,
    });
  }
};

export const updateLaptopDetails = async (req: Request, res: Response) => {
  try {
    const { serialNumber } = req.params;
    const updates = laptopDetailsSchema.partial().parse(req.body);

    const updatedLaptop = await laptopDetailsModel.findOneAndUpdate(
      { serialNumber },
      updates,
      { new: true }
    );

    if (!updatedLaptop) {
      return res.status(404).json({ message: "Laptop not found" });
    }
    res.status(200).json({
      message: "Laptop updated successfully",
      laptop: updatedLaptop,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ errors: error.errors });
    }
    res
      .status(500)
      .json({ message: "Error updating laptop details", error: error.message });
  }
};

export const getAllLaptopDetails = async (req: Request, res: Response) => {
  try {
    const laptops = await laptopDetailsModel.find();
    if (!laptops || laptops.length === 0) {
      return res.status(404).json({ message: "No laptops found" });
    }
    res.status(200).json({
      message: "Laptops retrieved successfully",
      count: laptops.length,
      data: laptops,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error getting laptop details", error: error.message });
  }
};

export const retireLaptop = async (req: Request, res: Response) => {
  try {
    const { serialNumber } = req.params;
    const retiredLaptop = await laptopDetailsModel.findOneAndUpdate(
      { serialNumber },
      { status: "Retired" },
      { new: true }
    );
    if (!retiredLaptop) {
      return res.status(404).json({ message: "Laptop not found" });
    }
    res.status(200).json({
      message: "Laptop retired successfully",
      laptop: retiredLaptop,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error retiring laptop", error: error.message });
  }
};

export const deleteLaptopDetails = async (req: Request, res: Response) => {
  try {
    const { serialNumber } = req.params;
    const deletedLaptop = await laptopDetailsModel.findOneAndDelete({
      serialNumber,
    });
    if (!deletedLaptop) {
      return res.status(404).json({ message: "Laptop not found" });
    }
    res.status(200).json({
      message: "Laptop deleted successfully",
      laptop: deletedLaptop,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error deleting laptop details", error: error.message });
  }
};
