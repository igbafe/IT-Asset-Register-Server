import { z } from "zod";

// Regex explanation:
// - At least 8 characters
// - Must contain at least one letter
// - Must contain at least one number
// - Must contain at least one special character
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const userSchemaZod = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .regex(
      passwordRegex,
      "Password must be at least 8 characters long and contain a mix of letters, numbers, and symbols"
    ),
});

// const otpSchema = z.object({
//   email: z.email(),
//   otp: z.string().length(6),
// });

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});


export {  userSchemaZod, loginSchema };
