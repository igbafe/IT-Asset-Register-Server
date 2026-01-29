import jwt, { Secret, SignOptions } from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN!;

export const createToken = (userId: string) => {
  const secretEnv = process.env.JWT_ACCESS_SECRET;
  if (!secretEnv)
    throw new Error("JWT_ACCESS_SECRET is not set in environment");
  const secret: Secret = secretEnv;

  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "15m") as SignOptions["expiresIn"];

  const options: SignOptions = {
    expiresIn,
  };

  const token = jwt.sign({ userId }, secret, options);

  return token;
};

export const generateRefreshToken = (userId: string) => {
  const secretEnv = process.env.JWT_REFRESH_SECRET;
  if (!secretEnv)
    throw new Error("JWT_REFRESH_SECRET is not set in environment");
  const secret: Secret = secretEnv;

  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ??
    "30d") as SignOptions["expiresIn"];

  const options: SignOptions = {
    expiresIn,
  };

  return jwt.sign({ userId }, secret, options);
};

export const verifyAccessToken = (token: string): { userId: string } => {
  const secretEnv = process.env.JWT_ACCESS_SECRET;
  if (!secretEnv)
    throw new Error("JWT_ACCESS_SECRET is not set in environment");
  const secret: Secret = secretEnv;
  
  return jwt.verify(token, secret) as { userId: string };
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  const secretEnv = process.env.JWT_REFRESH_SECRET;
  if (!secretEnv)
    throw new Error("JWT_REFRESH_SECRET is not set in environment");
  const secret: Secret = secretEnv;
  
  return jwt.verify(token, secret) as { userId: string };
};