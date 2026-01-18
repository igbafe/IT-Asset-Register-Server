import mongoose, { Schema } from "mongoose";
import { IBrandModel } from "../../types/types.js";

const BrandModelSchema: Schema = new Schema<IBrandModel>(
  {
    brandName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    models: {
      type: [String],
      required: true,
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.BrandModel ||
  mongoose.model<mongoose.Document & IBrandModel>(
    "BrandModel",
    BrandModelSchema
  );
