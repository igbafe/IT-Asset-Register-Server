import { Request, Response } from "express";
import laptopDetailsModel from "./laptopsModel.js";
import QRCode from "qrcode";
import { ZodError } from "zod";
import type { QRCodeToDataURLOptions } from "qrcode";

const getFrontendUrl = () =>
  process.env.FRONTEND_URL || "https://it-asset-register-client.onrender.com";

const qrOptions: QRCodeToDataURLOptions = {
  errorCorrectionLevel: "H",
  width: 300,
  margin: 2,
};

export const generateLaptopQRCode = async (req: Request, res: Response) => {
  try {
    const { serialNumber } = req.params;

    const laptop = await laptopDetailsModel.findOne({ serialNumber });
    if (!laptop) {
      return res.status(404).json({
        success: false,
        message: "Laptop not found",
      });
    }

    const scanUrl = `${getFrontendUrl()}/laptops/qr/${serialNumber}`;

    const qrCodeDataURL = await QRCode.toDataURL(scanUrl, qrOptions);

    return res.json({
      success: true,
      data: {
        ...laptop.toObject(), 
        scanUrl,              
        qrCode: qrCodeDataURL 
      },
      message: "QR code generated successfully",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.issues.map((e) => e.message),
      });
    }

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error generating QR code",
    });
  }
};

export const generateLaptopQRCodeForAll = async (
  req: Request,
  res: Response
) => {
  try {
    const laptops = await laptopDetailsModel.find();
    const frontendUrl = getFrontendUrl();

    const qrCodes = await Promise.all(
      laptops.map(async (laptop) => {
       
        const scanUrl = `${getFrontendUrl()}/laptops/qr/${laptop.serialNumber}`;
        const qrCode = await QRCode.toDataURL(scanUrl, qrOptions);

        return {
          // Basic Info
          laptopId: laptop._id,
          serialNumber: laptop.serialNumber,
          systemName: laptop.systemName,
          brand: laptop.brand,
          model: laptop.model,

          // System Specifications
          ram: laptop.ram,
          rom: laptop.rom,
          os: laptop.os,
          status: laptop.status,

          // User Information
          currentUser: laptop.currentUser,
          previousUser: laptop.previousUser,

          // Retirement Info
          retirementDate: laptop.retirementDate,
          retirementNote: laptop.retirementNote,

          // Timestamps
          createdAt: laptop.createdAt,
          updatedAt: laptop.updatedAt,
          scanUrl,
          qrCode,
        };
      })
    );

    return res.json({
      success: true,
      count: qrCodes.length,
      data: qrCodes,
      message: "QR codes generated successfully for all laptops",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error generating QR codes",
    });
  }
};

export const downloadLaptopQRCode = async (req: Request, res: Response) => {
  try {
    const { serialNumber } = req.params;

    const laptop = await laptopDetailsModel.findOne({ serialNumber });
    if (!laptop) {
      return res.status(404).json({
        success: false,
        message: "Laptop not found",
      });
    }

    const scanUrl = `${getFrontendUrl()}/laptops/qr/${serialNumber}`;

    const buffer = await QRCode.toBuffer(scanUrl, {
      errorCorrectionLevel: "H",
      width: 500,
      margin: 2,
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="QR-${serialNumber}.png"`
    );

    return res.send(buffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error downloading QR code",
    });
  }
};
