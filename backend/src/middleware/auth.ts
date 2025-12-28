import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

export async function authRequired(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== "string") {
    return res.status(401).json({ message: "missing authorization header" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return res.status(401).json({ message: "invalid authorization header" });
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("email role name");
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (err) {
    console.error("Auth middleware error", err);
    return res.status(401).json({ message: "invalid or expired token" });
  }
}

export function requireRole(role: "admin") {
  return function roleMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      return res.status(401).json({ message: "unauthorized" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: "forbidden" });
    }

    return next();
  };
}
