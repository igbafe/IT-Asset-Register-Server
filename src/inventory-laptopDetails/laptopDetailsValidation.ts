import { z } from "zod";

export const laptopDetailsSchema = z.object({
  systemName: z.string().min(1, { message: "System name is required" }),
  brand: z.string().min(1, { message: "Brand is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  serialNumber: z.string().min(1, { message: "Serial number is required" }),
  ram: z.string().min(1, { message: "RAM is required" }),
  rom: z.string().min(1, { message: "ROM is required" }),
  os: z.string().min(1, { message: "Operating system is required" }),
  status: z
    .enum(["Available", "In Use", "Retired", "In Repair","Fully Depreciated"])
    .default("Available"),
});

export type LaptopDetailsInput = z.infer<typeof laptopDetailsSchema>;
