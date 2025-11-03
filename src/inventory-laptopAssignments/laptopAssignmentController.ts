import type { Request, Response } from "express";
import { laptopAssignmentSchema } from "./laptopAssignmentValidation.js";
import laptopAssignmentModel from "./laptopAssignmentModel.js";

export const assignLaptop = async (req: Request, res: Response) => {
  try {
    const assignment = laptopAssignmentSchema.parse(req.body);

    const activeAssignment = await laptopAssignmentModel.findOne({
      serialNumber: assignment.serialNumber,
      status: "Active",
    });

    if (activeAssignment) {
      return res.status(400).json({
        success: false,
        message: `Laptop with serial ${assignment.serialNumber} is already assigned to ${activeAssignment.fullName}`,
      });
    }

    const newAssignment = new laptopAssignmentModel({
      ...assignment,
      assignedDate: new Date(),
      status: "Active",
    });

    await newAssignment.save();
    res.status(201).json({
      message: "Laptop assigned successfully",
      assignment: newAssignment,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({
      message: "Error assigning laptop details",
      error: error.message,
    });
  }
};

export const reassignLaptop = async (req: Request, res: Response) => {
  try {
    const { serialNumber } = req.params;
    const parsed = laptopAssignmentSchema.parse(req.body);

    const currentAssignment = await laptopAssignmentModel.findOne({
      serialNumber,
      status: "Active",
    });

    if (!currentAssignment) {
      return res.status(404).json({
        success: false,
        message: "No active assignment found for this laptop",
      });
    }

    currentAssignment.status = "Returned";
    currentAssignment.returnedDate = new Date();
    await currentAssignment.save();

    const newAssignment = new laptopAssignmentModel({
      ...parsed,
      serialNumber, // keep same laptop
      assignedDate: new Date(),
      status: "Active",
    });

    await newAssignment.save();

    res.status(201).json({
      success: true,
      message: "Laptop reassigned successfully",
      previousAssignment: currentAssignment,
      newAssignment,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({
      success: false,
      message: "Error reassigning laptop",
      error: error.message,
    });
  }
};

export const updateLaptop = async (req: Request, res: Response) => {
  try {
    const { _id } = req.params;
    const updates = laptopAssignmentSchema.partial().parse(req.body);

    const updatedLaptop = await laptopAssignmentModel.findByIdAndUpdate(
      _id,
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
    res.status(500).json({
      message: "Error updating laptop details",
      error: error.message,
    });
  }
};

export const getLaptopBySerailNumber = async (req: Request, res: Response) => {
  try {
    const { serialNumber } = req.params;
    const laptop = await laptopAssignmentModel
      .find({ serialNumber })
      .sort({ assignedDate: -1 }) // 👈 sorts newest first
      .lean();
    if (!laptop) {
      return res.status(404).json({ message: "Laptop not found" });
    }
    res.status(200).json({
      message: "Laptop retrieved successfully",
      laptop,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({
      message: "Error getting laptop details by serial number",
      error: error.message,
    });
  }
};

export const getAllLaptops = async (req: Request, res: Response) => {
  try {
    const laptops = await laptopAssignmentModel.find();
    res.status(200).json({
      message: "Laptops retrieved successfully",
      laptops,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error getting laptop details",
      error: error.message,
    });
  }
};

export const retireAssignment = async (req: Request, res: Response) => {
  try {
    const { systemName } = req.params;
    const retireAssignment = await laptopAssignmentModel.findOneAndUpdate(
      { systemName },
      { status: "Retired" },
      { new: true }
    );
    if (!retireAssignment) {
      return res.status(404).json({ message: "Laptop not found" });
    }
    res.status(200).json({
      message: "Laptop Assignment retired successfully",
      laptop: retireAssignment,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error retiring Assignment", error: error.message });
  }
};
