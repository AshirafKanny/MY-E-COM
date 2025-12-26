import { Router } from "express";
import mongoose from "mongoose";
import { getDbState } from "../config/db.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    db: {
      state: getDbState(),
      readyState: mongoose.connection.readyState,
    },
  });
});

export default router;
