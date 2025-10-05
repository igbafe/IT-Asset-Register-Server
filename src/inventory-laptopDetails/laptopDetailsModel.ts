import mongoose, { Schema } from "mongoose";

export interface ILaptopDetails {
  systemName: string;
  brand: string;
  model: string;
  serialNumber: string;
  ram: string;
  rom: string;
  os: string;
  status: "Available" | "In Use" | "Retired" | "In Repair" | "Fully Depreciated";
}

const LaptopDetailsSchema: Schema = new Schema<ILaptopDetails>(
  {
    systemName: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    serialNumber: { type: String, required: true, unique: true },
    ram: { type: String, required: true },
    rom: { type: String, required: true },
    os: { type: String, required: true },
    status: {
      type: String,
      enum: ["Available", "In Use", "Retired", "In Repair"],
      default: "Available",
    },
  },
  { timestamps: true }
);

export default mongoose.models.LaptopDetails ||
  mongoose.model<mongoose.Document & ILaptopDetails>("Laptop", LaptopDetailsSchema);
