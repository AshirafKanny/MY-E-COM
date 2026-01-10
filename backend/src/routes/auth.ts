import { Router } from "express";
import { User } from "../models/User.js";
import { signAccessToken } from "../utils/jwt.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

type RegisterBody = {
  email?: string;
  password?: string;
  name?: string;
};

type LoginBody = {
  email?: string;
  password?: string;
};

function getUserId(user: { id?: string; _id?: { toString(): string } }) {
  return user.id ?? user._id?.toString() ?? "";
}

function toPublicUser(user: { id?: string; _id?: { toString(): string }; email: string; name?: string; role: string }) {
  return {
    id: getUserId(user),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body as RegisterBody;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "email already in use" });
    }

    const user = new User({ email, password, name });
    await user.save();

    const accessToken = signAccessToken(user);
    res.status(201).json({ user: toPublicUser(user), accessToken });
  } catch (err) {
    console.error("Register error", err);
    res.status(500).json({ message: "Failed to register" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body as LoginBody;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const accessToken = signAccessToken(user);
    res.json({ user: toPublicUser(user), accessToken });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ message: "Failed to login" });
  }
});

router.get("/me", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select("email role name");
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error("Me error", err);
    res.status(500).json({ message: "Failed to load user" });
  }
});

export default router;
