import type { Request, Response } from "express";
import laptopDetailsModel from "./laptopsModel.js";
import { laptopDetailsSchema } from "./laptopsValidation.js";
import { success, ZodError } from "zod";
import { LaptopStatus } from "../types/types.js";

// CRUD Operations for Laptop Details
export const addLaptopDetails = async (req: Request, res: Response) => {
  try {
    const laptopDetails = laptopDetailsSchema.parse(req.body);

    // Check serial number
    const serialExists = await laptopDetailsModel.findOne({
      serialNumber: laptopDetails.serialNumber,
    });

    if (serialExists) {
      return res.status(400).json({
        success: false,
        message: "Laptop with this serial number already exists",
      });
    }

    // Check system name
    const systemNameExists = await laptopDetailsModel.findOne({
      systemName: laptopDetails.systemName,
    });

    if (systemNameExists) {
      return res.status(400).json({
        success: false,
        message: "Laptop with this system name already exists",
      });
    }

    const newLaptopDetails = new laptopDetailsModel(laptopDetails);
    newLaptopDetails.status = LaptopStatus.AVAILABLE;
    await newLaptopDetails.save();
    res.status(201).json({
      message: "Laptop details added successfully",
      laptop: newLaptopDetails,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ success: false, errors: error.issues.map((e) => e.message) });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Error Adding Laptop" });
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
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ success: false, errors: error.issues.map((e) => e.message) });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error getting details by serial number",
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
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ success: false, errors: error.issues.map((e) => e.message) });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating laptop" });
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
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ success: false, errors: error.issues.map((e) => e.message) });
    }
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error getting all laptops" });
  }
};

export const retireLaptop = async (req: Request, res: Response) => {
  try {
    const { serialNumber } = req.params;
    const { retirementNote } = req.body;

    const retiredLaptop = await laptopDetailsModel.findOne({ serialNumber });

    if (!retiredLaptop) {
      return res.status(404).json({ message: "Laptop not found" });
    }

    if (retiredLaptop.status === LaptopStatus.RETIRED) {
      return res.status(400).json({
        success: false,
        message: "Laptop is already retired",
      });
    }

    // Move currentUser to previousUser if assigned
    if (retiredLaptop.currentUser) {
      const mapCurrentToPrevious = (
        user: typeof retiredLaptop.currentUser
      ) => ({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department,
        assignedDate: user.assignedDate,
        returnedDate: new Date(),
      });

      const previousUsers = retiredLaptop.previousUser || [];
      previousUsers.push(mapCurrentToPrevious(retiredLaptop.currentUser));

      retiredLaptop.previousUser = previousUsers;
      retiredLaptop.currentUser = null;
    }

    retiredLaptop.status = LaptopStatus.RETIRED;
    retiredLaptop.retirementDate = new Date();

    if (retirementNote) {
      retiredLaptop.retirementNote = retirementNote;
    }

    await retiredLaptop.save();

    res.status(200).json({
      success: true,
      message: "Laptop retired successfully",
      laptop: retiredLaptop,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ success: false, errors: error.issues.map((e) => e.message) });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Error retiring laptop" });
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
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ success: false, errors: error.issues.map((e) => e.message) });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting Laptop" });
  }
};

// Assignment Operations for Laptop Details
