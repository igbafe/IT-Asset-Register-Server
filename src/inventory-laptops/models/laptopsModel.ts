import mongoose, { Schema } from "mongoose";
import { ILaptopDetails, LaptopStatus, LaptopUser } from "../../types/types.js";

const LaptopUserSchema: Schema<LaptopUser> = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    assignedDate: { type: Date, required: true },
    returnedDate: { type: Date },
  },
  { _id: false }
);

LaptopUserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const LaptopDetailsSchema: Schema = new Schema<ILaptopDetails>(
  {
    currentUser: {
      type: LaptopUserSchema,
      default: null,
    },
    previousUser: {
      type: [LaptopUserSchema], 
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
    decommissionDate: { type: Date },
    decommissionNote: { type: String },
    purchaseDate: { type: Date },
    endOfLifeDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.LaptopDetails ||
  mongoose.model<mongoose.Document & ILaptopDetails>(
    "Laptop",
    LaptopDetailsSchema
  );
