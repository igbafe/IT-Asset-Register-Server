// middleware/authMiddleware.ts
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET not set");
    }

    // This will throw an error if token is expired
    const decoded = jwt.verify(token, secret) as { _id: string };
    (req as any).userId = decoded._id;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log(" Token expired!");
      return res.status(401).json({ message: "Token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      console.log(" Invalid token");
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};
