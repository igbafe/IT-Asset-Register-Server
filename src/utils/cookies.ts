// utils/cookies.ts
import type { Response } from "express";

const isProd = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
};

export const setAccessTokenCookie = (res: Response, token: string) => {
  res.cookie("accessToken", token, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
  });
};

export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    ...baseCookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/", // ✅ Changed from "/api/user/refresh"
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", {
    ...baseCookieOptions,
    path: "/",
  });

  res.clearCookie("refreshToken", {
    ...baseCookieOptions,
    path: "/", // ✅ Changed from "/api/user/refresh"
  });
};
