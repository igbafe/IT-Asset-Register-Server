import { z } from "zod";

export const laptopAssignmentSchema = z.object({
  systemName: z.string().min(1, "System name is required"),
  serialNumber: z.string().optional(), // <-- now optional
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  email: z.email("Invalid email address"),
  department: z.string().min(2, "Department is required"),
  assignedDate: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().refine((d) => d !== undefined, {
      message: "Assigned date is required",
    })
  ),
  returnedDate: z
    .preprocess(
      (val) => (val ? new Date(val as string) : undefined),
      z.date().optional()
    )
    .optional(),
  status: z.enum(["Active", "Returned", "Retired"]).optional(), // <-- now optional
});

export type LaptopAssignmentInput = z.infer<typeof laptopAssignmentSchema>;
