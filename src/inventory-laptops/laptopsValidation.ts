import { z } from "zod";
import { LaptopStatus } from "../types/types.js";

export const laptopDetailsSchema = z.object({
  currentUser: z
    .object({
      fullName: z.string().min(1, { message: "Full name is required" }),
      email: z.email({ message: "Invalid email address" }),
      department: z.string().min(1, { message: "Department is required" }),
      assignedDate: z.coerce.date().refine((d) => d.getTime() <= Date.now(), {
        message: "Assigned date cannot be in the future",
      }),
    })
    .nullable()
    .optional(),
  previousUser: z
    .array(
      z.object({
        fullName: z.string().min(1, { message: "Full name is required" }),
        email: z.email({ message: "Invalid email address" }),
        department: z.string().min(1, { message: "Department is required" }),
        assignedDate: z.coerce.date().refine((d) => d.getTime() <= Date.now(), {
          message: "Assigned date cannot be in the future",
        }),
        returnedDate: z.coerce
          .date()
          .refine((d) => d.getTime() <= Date.now(), {
            message: "Returned date cannot be in the future",
          })
          .optional(),
      })
    )
    .optional(),
  systemName: z.string().min(1, { message: "System name is required" }),
  brand: z.string().min(1, { message: "Brand is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  serialNumber: z.string().min(1, { message: "Serial number is required" }),
  ram: z.string().min(1, { message: "RAM is required" }),
  rom: z.string().min(1, { message: "ROM is required" }),
  os: z.string().min(1, { message: "Operating system is required" }),
  status: z.enum(LaptopStatus).optional(),
  retirementDate: z.coerce.date().optional(),
  retirementNote: z.string().optional(),
});

export type LaptopDetailsInput = z.infer<typeof laptopDetailsSchema>;

export const assignLaptopSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  email: z.email({ message: "Invalid email address" }),
  department: z.string().min(1, { message: "Department is required" }),
});

// Schema for reassigning a laptop (same as assign)
export const reassignLaptopSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  email: z.email({ message: "Invalid email address" }),
  department: z.string().min(1, { message: "Department is required" }),
});

// Schema for updating current user details
export const updateCurrentUserSchema = z
  .object({
    fullName: z
      .string()
      .min(1, { message: "Full name is required" })
      .or(z.literal("")),
    email: z.email({ message: "Invalid email address" }).or(z.literal("")),
    department: z
      .string()
      .min(1, { message: "Department is required" })
      .or(z.literal("")),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type AssignLaptopInput = z.infer<typeof assignLaptopSchema>;
export type ReassignLaptopInput = z.infer<typeof reassignLaptopSchema>;
export type UpdateCurrentUserInput = z.infer<typeof updateCurrentUserSchema>;
