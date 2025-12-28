import { Router } from "express";
import mongoose from "mongoose";
import { getDbState } from "../config/db.js";
import authRouter from "./auth.js";
import productsRouter from "./products.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/products", productsRouter);

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
