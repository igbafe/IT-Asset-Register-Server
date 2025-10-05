import mongoose, { Document, Model, Schema } from "mongoose";

// TypeScript interface for User
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  otp?: string;
  otpExpiry?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
}

// User Mongoose schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

// model
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export { User };
