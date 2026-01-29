import type { Request, Response } from "express";
import BrandModelModel from "../models/laptopBrandModel.js";
import {
  brandModelSchema,
  addModelSchema,
} from "../validations/brandModelValidation.js";
import { ZodError } from "zod";

export const createBrand = async (req: Request, res: Response) => {
  try {
    const { brandName: rawBrandName, models: rawModels } =
      brandModelSchema.parse(req.body);

    const brandName =
      rawBrandName.charAt(0).toUpperCase() + rawBrandName.slice(1);
    const models = rawModels.map((m) => m.charAt(0).toUpperCase() + m.slice(1));

    const existingBrand = await BrandModelModel.findOne({
      brandName: { $regex: new RegExp(`^${brandName}$`, "i") },
    });

    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: "Brand already exists",
      });
    }

    // Check for duplicate models in the provided array
    const uniqueModels = [...new Set(models)];
    if (uniqueModels.length !== models.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate models found in the list",
      });
    }

    const newBrand = new BrandModelModel({ brandName, models: uniqueModels });
    await newBrand.save();

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: newBrand,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.issues.map((e) => e.message),
      });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Error creating brand" });
  }
};

// Get all brands with their models
export const getAllBrands = async (req: Request, res: Response) => {
  try {
    const brands = await BrandModelModel.find().sort({ brandName: 1 });

    if (!brands || brands.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No brands found",
      });
    }

    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching brands" });
  }
};

// Get models for a specific brand
export const getModelsByBrand = async (req: Request, res: Response) => {
  try {
    const { brandName } = req.params;

    const brand = await BrandModelModel.findOne({ brandName });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        brandName: brand.brandName,
        models: brand.models,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching models" });
  }
};

// Add a model to an existing brand
export const addModelToBrand = async (req: Request, res: Response) => {
  try {
    const { brandName } = req.params;
    const { model: rawModel } = addModelSchema.parse(req.body);
    const model = rawModel.charAt(0).toUpperCase() + rawModel.slice(1);

    const brand = await BrandModelModel.findOne({ brandName });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Check if model already exists
    if (brand.models.includes(model)) {
      return res.status(400).json({
        success: false,
        message: "Model already exists for this brand",
      });
    }

    brand.models.push(model);
    await brand.save();

    res.status(200).json({
      success: true,
      message: "Model added successfully",
      data: brand,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.issues.map((e) => e.message),
      });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding model" });
  }
};

// Remove a model from a brand
export const removeModelFromBrand = async (req: Request, res: Response) => {
  try {
    const { brandName, model } = req.params;

    const brand = await BrandModelModel.findOne({ brandName });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    const modelIndex = brand.models.indexOf(model);
    if (modelIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Model not found for this brand",
      });
    }

    brand.models.splice(modelIndex, 1);
    await brand.save();

    res.status(200).json({
      success: true,
      message: "Model removed successfully",
      data: brand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error removing model" });
  }
};

// Delete a brand
export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { brandName } = req.params;

    const deletedBrand = await BrandModelModel.findOneAndDelete({ brandName });

    if (!deletedBrand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
      data: deletedBrand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting brand" });
  }
};

// Update an individual model
export const updateModel = async (req: Request, res: Response) => {
  try {
    const { brandName, model } = req.params;
    let { newModel } = req.body;

    if (newModel) {
      newModel = newModel.charAt(0).toUpperCase() + newModel.slice(1);
    }

    const brand = await BrandModelModel.findOne({ brandName });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    const modelIndex = brand.models.indexOf(model);
    if (modelIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Model not found for this brand",
      });
    }

    brand.models[modelIndex] = newModel;
    await brand.save();

    res.status(200).json({
      success: true,
      message: "Model updated successfully",
      data: brand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating models" });
  }
};

// Update brand name
export const updateBrandName = async (req: Request, res: Response) => {
  try {
    const { brandName } = req.params;
    const { newBrandName } = req.body;

    if (!newBrandName || newBrandName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "New brand name is required",
      });
    }

    const brand = await BrandModelModel.findOne({ brandName });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Check if new name already exists
    const existingBrand = await BrandModelModel.findOne({
      brandName: { $regex: new RegExp(`^${newBrandName}$`, "i") },
    });

    if (existingBrand && existingBrand.brandName !== brandName) {
      return res.status(400).json({
        success: false,
        message: "Brand name already exists",
      });
    }

    const formattedBrandName =
      newBrandName.trim().charAt(0).toUpperCase() +
      newBrandName.trim().slice(1);

    brand.brandName = formattedBrandName;
    await brand.save();

    res.status(200).json({
      success: true,
      message: "Brand name updated successfully",
      data: brand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating brand" });
  }
};
