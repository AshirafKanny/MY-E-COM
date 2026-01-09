import { Router } from "express";
import mongoose from "mongoose";
import { authRequired, requireRole } from "../middleware/auth.js";
import { Product } from "../models/Product.js";

const router = Router();

router.get("/", async (req, res) => {
  const { q, category, featured, minPrice, maxPrice, inStock, sort = "newest", page = "1", limit = "12" } = req.query;

  const filters: Record<string, unknown> = {};

  if (q && typeof q === "string") {
    filters.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  if (category && typeof category === "string") {
    filters.category = category;
  }

  if (featured === "true") {
    filters.isFeatured = true;
  }

  if (inStock === "true") {
    filters.stock = { $gt: 0 };
  }

  if (minPrice || maxPrice) {
    filters.price = {} as Record<string, number>;
    if (minPrice) (filters.price as Record<string, number>).$gte = Number(minPrice);
    if (maxPrice) (filters.price as Record<string, number>).$lte = Number(maxPrice);
  }

  const pageNum = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 12, 1), 50);
  const skip = (pageNum - 1) * pageSize;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    stockDesc: { stock: -1 },
  };
  const sortOption = sortMap[String(sort)] || sortMap.newest;

  const [items, total] = await Promise.all([
    Product.find(filters).sort(sortOption).skip(skip).limit(pageSize),
    Product.countDocuments(filters),
  ]);

  res.json({ items, total, page: pageNum, pageSize });
});

router.get("/categories", async (_req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ categories: categories.filter(Boolean).sort() });
  } catch (err) {
    console.error("List categories error", err);
    res.status(500).json({ message: "failed to list categories" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "invalid product id" });
  }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }

  res.json({ product });
});

router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  const { title, description, price, image, category, stock, isFeatured } = req.body;

  if (!title || typeof price === "undefined") {
    return res.status(400).json({ message: "title and price are required" });
  }

  try {
    const product = new Product({ title, description, price, image, category, stock, isFeatured });
    await product.save();
    res.status(201).json({ product });
  } catch (err) {
    console.error("Create product error", err);
    res.status(500).json({ message: "failed to create product" });
  }
});

router.put("/:id", authRequired, requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "invalid product id" });
  }

  const { title, description, price, image, category, stock, isFeatured } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    if (typeof title !== "undefined") product.title = title;
    if (typeof description !== "undefined") product.description = description;
    if (typeof price !== "undefined") product.price = price;
    if (typeof image !== "undefined") product.image = image;
    if (typeof category !== "undefined") product.category = category;
    if (typeof stock !== "undefined") product.stock = stock;
    if (typeof isFeatured !== "undefined") product.isFeatured = isFeatured;

    await product.save();
    res.json({ product });
  } catch (err) {
    console.error("Update product error", err);
    res.status(500).json({ message: "failed to update product" });
  }
});

router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "invalid product id" });
  }

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    res.json({ message: "product deleted" });
  } catch (err) {
    console.error("Delete product error", err);
    res.status(500).json({ message: "failed to delete product" });
  }
});

router.patch("/:id/stock", authRequired, requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "invalid product id" });
  }

  if (typeof stock !== "number" || stock < 0) {
    return res.status(400).json({ message: "stock must be a non-negative number" });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { stock } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    res.json({ product });
  } catch (err) {
    console.error("Restock product error", err);
    res.status(500).json({ message: "failed to update stock" });
  }
});

export default router;
