
import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "../types/types";

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
      // Password only required for local auth users
      required: function(this: IUser) {
        return this.authProvider === 'local' || this.authProvider === 'both';
      },
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
    
    // NEW: OAuth fields
    googleId: {
      type: String,
      sparse: true, // Allows null but unique when present
      unique: true,
    },
    picture: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'both'],
      default: 'local',
    },
  },
  { timestamps: true }
);

// Create compound index to prevent duplicate OAuth accounts
userSchema.index({ googleId: 1 }, { sparse: true });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export { User };