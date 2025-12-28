import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { IUser } from "../models/User.js";

export type AccessTokenPayload = jwt.JwtPayload & {
  sub: string;
  role: string;
  email: string;
};

export function signAccessToken(user: IUser) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
}
