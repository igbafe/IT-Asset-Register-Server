import { Request, Response } from "express";
import {
  assignLaptopSchema,
  reassignLaptopSchema,
  updateCurrentUserSchema,
} from "./laptopsValidation.js";
import { LaptopStatus } from "../types/types.js";
import laptopDetailsModel from "./laptopsModel.js";
import { ZodError } from "zod";

// Assign laptop to a user (initial assignment)
export const assignLaptop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate input
    const validation = assignLaptopSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const { firstName, lastName, email, department } = validation.data;

    const laptop = await laptopDetailsModel.findById(id);

    if (!laptop) {
      return res.status(404).json({
        success: false,
        message: "Laptop not found",
      });
    }

    // Check if laptop is available
    if (
      laptop.status !== LaptopStatus.AVAILABLE &&
      laptop.status !== LaptopStatus.RETURNED
    ) {
      return res.status(400).json({
        success: false,
        message: `Laptop cannot be assigned. Current status: ${laptop.status}`,
      });
    }

    // Check if already assigned
    if (laptop.currentUser) {
      return res.status(400).json({
        success: false,
        message: "Laptop is already assigned. Use reassign endpoint instead.",
      });
    }

    // Assign laptop
    laptop.currentUser = {
      firstName,
      lastName,
      email,
      department,
      assignedDate: new Date(),
    };
    laptop.status = LaptopStatus.ASSIGNED;

    await laptop.save();

    return res.status(200).json({
      success: true,
      message: "Laptop assigned successfully",
      data: laptop,
    });
  } catch (error) {
    console.error("Error assigning laptop:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign laptop",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Reassign laptop to a new user (moves current to previous)
export const reassignLaptop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate input
    const validation = reassignLaptopSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const { firstName, lastName, email, department } = validation.data;

    const laptop = await laptopDetailsModel.findById(id);

    if (!laptop) {
      return res.status(404).json({
        success: false,
        message: "Laptop not found",
      });
    }

    // Check if laptop has a current user
    if (!laptop.currentUser) {
      return res.status(400).json({
        success: false,
        message:
          "No user is currently assigned to this laptop. Use assign endpoint instead.",
      });
    }

    // Check if laptop is assigned
    if (laptop.status !== LaptopStatus.ASSIGNED) {
      return res.status(400).json({
        success: false,
        message: `Laptop cannot be reassigned. Current status: ${laptop.status}`,
      });
    }

    // Move current user to previous users array
    const previousUsers = laptop.previousUser || [];
    previousUsers.push({
      firstName: laptop.currentUser.firstName,
      lastName: laptop.currentUser.lastName,
      email: laptop.currentUser.email,
      department: laptop.currentUser.department,
      assignedDate: laptop.currentUser.assignedDate,
      returnedDate: new Date(),
    });

    // Assign to new user
    laptop.currentUser = {
      firstName,
      lastName,
      email,
      department,
      assignedDate: new Date(),
    };
    laptop.previousUser = previousUsers;
    laptop.status = LaptopStatus.ASSIGNED;

    await laptop.save();

    return res.status(200).json({
      success: true,
      message: "Laptop reassigned successfully",
      data: laptop,
    });
  } catch (error) {
    console.error("Error reassigning laptop:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reassign laptop",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update current user details (without reassignment)
export const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const validation = updateCurrentUserSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const updates = validation.data;

    const laptop = await laptopDetailsModel.findById(id);

    if (!laptop) {
      return res.status(404).json({
        success: false,
        message: "Laptop not found",
      });
    }

    if (!laptop.currentUser) {
      return res.status(400).json({
        success: false,
        message: "No user is currently assigned to this laptop",
      });
    }

    // Build dot notation updates for nested fields
    const mergedCurrentUser = {
      firstName: updates.firstName ?? laptop.currentUser.firstName,
      lastName: updates.lastName ?? laptop.currentUser.lastName,
      email: updates.email ?? laptop.currentUser.email,
      department: updates.department ?? laptop.currentUser.department,
      assignedDate: laptop.currentUser.assignedDate,
      returnedDate: laptop.currentUser.returnedDate,
    };

    const updatedLaptop = await laptopDetailsModel.findByIdAndUpdate(
      id,
      {
        $set: {
          currentUser: mergedCurrentUser,
        },
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Current user updated successfully",
      data: updatedLaptop,
    });
  } catch (error) {
    console.error("Error updating current user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update current user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const returnCurrentUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const laptop = await laptopDetailsModel.findById(id);

    if (!laptop) {
      return res.status(404).json({
        success: false,
        message: "Laptop not found",
      });
    }

    if (
      laptop.status === LaptopStatus.RETURNED ||
      laptop.status === LaptopStatus.RETIRED
    ) {
      return res.status(400).json({
        success: false,
        message: `Laptop is already in ${laptop.status} status.`,
      });
    }

    if (!laptop.currentUser) {
      return res.status(400).json({
        success: false,
        message: "No user is currently assigned to this laptop.",
      });
    }

    if (laptop.status !== LaptopStatus.ASSIGNED) {
      return res.status(400).json({
        success: false,
        message: `Laptop is not in assigned status. Current status: ${laptop.status}`,
      });
    }

    const mapCurrentToPrevious = (user: typeof laptop.currentUser) => ({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      department: user.department,
      assignedDate: user.assignedDate,
      returnedDate: new Date(),
    });

    const previousUsers = laptop.previousUser || [];
    previousUsers.push(mapCurrentToPrevious(laptop.currentUser));

    laptop.currentUser = null;
    laptop.previousUser = previousUsers;
    laptop.status = LaptopStatus.RETURNED;

    await laptop.save();

    return res.status(200).json({
      success: true,
      message: "Laptop returned successfully",
      data: laptop,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json({ success: false, errors: error.issues.map((e) => e.message) });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Error returning laptop" });
  }
};

// Get all users (current and previous) for a laptop
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const laptop = await laptopDetailsModel
      .findById(id)
      .select("systemName serialNumber currentUser previousUser status");

    if (!laptop) {
      return res.status(404).json({
        success: false,
        message: "Laptop not found",
      });
    }

    const users = {
      laptopInfo: {
        systemName: laptop.systemName,
        serialNumber: laptop.serialNumber,
        status: laptop.status,
      },
      currentUser: laptop.currentUser || null,
      previousUsers: laptop.previousUser || [],
      totalAssignments:
        (laptop.previousUser?.length || 0) + (laptop.currentUser ? 1 : 0),
    };

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
