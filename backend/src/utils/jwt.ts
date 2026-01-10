import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { IUser } from "../models/User.js";

export type AccessTokenPayload = jwt.JwtPayload & {
  sub: string;
  role: string;
  email: string;
};

function getUserId(user: IUser & { _id?: { toString(): string }; id?: string }) {
  return user.id ?? user._id?.toString() ?? "";
}

export function signAccessToken(user: IUser & { _id?: { toString(): string }; id?: string }) {
  const sub = getUserId(user);
  return jwt.sign(
    {
      sub,
      role: user.role,
      email: user.email,
    },
    env.jwtSecret as jwt.Secret,
    { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] }
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
}
