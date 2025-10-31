import mongoose, { Schema, Document } from "mongoose";

export interface ILaptopAssignment extends Document {
  systemName: string;
  serialNumber: string;
  fullName: string;
  email: string;
  department: string;
  assignedDate: Date;
  returnedDate?: Date;
  status: "Active" | "Returned" | "Retired";
}

const LaptopAssignmentSchema: Schema = new Schema(
  {
    systemName: { type: String, required: true },
    serialNumber: { type: String, required: true }, // link to Laptop
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    assignedDate: { type: Date, required: true, default: Date.now },
    returnedDate: { type: Date },
    status: {
      type: String,
      enum: ["Active", "Returned", "Retired"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.LaptopAssignment ||
  mongoose.model<ILaptopAssignment>("LaptopAssignment", LaptopAssignmentSchema);
