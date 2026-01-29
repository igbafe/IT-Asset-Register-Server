import { Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  refreshTokens: string[];
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
}

export interface ILaptopDetails {
  currentUser?: LaptopUser | null;
  previousUser?: LaptopUser[];
  systemName: string;
  brand: string;
  model: string;
  serialNumber: string;
  ram: string;
  rom: string;
  os: string;
  status: LaptopStatus;
  purchaseDate: Date;
  endOfLifeDate?: Date;
  decommissionDate?: Date;
  decommissionNote?: string;
}

export enum LaptopStatus {
  AVAILABLE = "available", // Just added, not assigned yet
  ASSIGNED = "assigned", // Currently assigned to someone
  RETURNED = "returned", // Assignment is over, back in inventory
  DECOMMISSIONED = "decommissioned", // End of life, out of service
}

export interface LaptopUser {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  assignedDate: Date;
  returnedDate?: Date;
}

export interface IBrandModel {
  brandName: string;
  models: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
