import mongoose, { Schema } from "mongoose";
import { ILaptopDetails, LaptopStatus, LaptopUser } from "../types/types.js";

const LaptopUserSchema: Schema<LaptopUser> = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    assignedDate: { type: Date, required: true },
    returnedDate: { type: Date },
  },
  { _id: false }
);

const LaptopDetailsSchema: Schema = new Schema<ILaptopDetails>(
  {
    currentUser: {
      type: LaptopUserSchema,
      default: null,
    },
    previousUser: {
      type: [LaptopUserSchema], // ✅ make it an array to match type
      default: [],
    },
    systemName: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    serialNumber: { type: String, required: true, unique: true },
    ram: { type: String, required: true },
    rom: { type: String, required: true },
    os: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(LaptopStatus),
        default: null,
    },
    retirementDate: { type: Date },
    retirementNote: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.LaptopDetails ||
  mongoose.model<mongoose.Document & ILaptopDetails>(
    "Laptop",
    LaptopDetailsSchema
  );
