import { Router } from "express";
import mongoose from "mongoose";
import { authRequired, requireRole } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { env } from "../config/env.js";
import { stripe } from "../utils/stripe.js";

const router = Router();

const allowedStatuses = ["pending", "paid", "shipped", "completed", "cancelled"] as const;
type AllowedStatus = (typeof allowedStatuses)[number];

const transitions: Record<AllowedStatus, AllowedStatus[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const allowedPaymentMethods = ["card", "cod"] as const;
type AllowedPaymentMethod = (typeof allowedPaymentMethods)[number];

type OrderItemInput = {
  productId?: string;
  quantity?: number;
};

type ShippingAddressInput = {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  postalCode?: string;
};

router.post("/", authRequired, async (req, res) => {
  const itemsInput = Array.isArray(req.body?.items) ? (req.body.items as OrderItemInput[]) : [];
  const paymentMethod: AllowedPaymentMethod = allowedPaymentMethods.includes(req.body?.paymentMethod)
    ? (req.body.paymentMethod as AllowedPaymentMethod)
    : "cod";
  const shippingInput = (req.body?.shippingAddress || {}) as ShippingAddressInput;

  if (paymentMethod === "card" && !stripe) {
    return res.status(400).json({ message: "Card payments are not configured" });
  }

  if (!itemsInput.length) {
    return res.status(400).json({ message: "items are required" });
  }

  const requiredShippingFields: (keyof ShippingAddressInput)[] = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "country",
    "postalCode",
  ];

  const missingShipping = requiredShippingFields.find((key) => !shippingInput[key] || typeof shippingInput[key] !== "string");
  if (missingShipping) {
    return res.status(400).json({ message: `shippingAddress.${missingShipping} is required` });
  }

  const validItems = itemsInput.filter(
    (item) =>
      item &&
      typeof item.productId === "string" &&
      mongoose.isValidObjectId(item.productId) &&
      typeof item.quantity === "number" &&
      item.quantity > 0
  );

  if (!validItems.length) {
    return res.status(400).json({ message: "no valid items provided" });
  }

  const productIds = validItems.map((i) => i.productId as string);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const orderItems = [] as {
    product: mongoose.Types.ObjectId;
    title: string;
    price: number;
    quantity: number;
  }[];

  for (const item of validItems) {
    const product = productMap.get(item.productId!);
    if (!product) {
      return res.status(400).json({ message: `product not found: ${item.productId}` });
    }

    const quantity = Math.max(1, Math.floor(item.quantity || 1));
    if (typeof product.stock === "number" && product.stock < quantity) {
      return res.status(400).json({ message: `not enough stock for ${product.title}` });
    }

    orderItems.push({
      product: product._id,
      title: product.title,
      price: product.price,
      quantity,
    });
  }

  const total = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let paymentIntentClientSecret: string | undefined;
  let stripePaymentIntentId: string | undefined;

  try {
    // Decrement stock for each item atomically by filtering on available stock
    const bulkOps = orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product, stock: { $gte: item.quantity } },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

    const bulkResult = await Product.bulkWrite(bulkOps, { ordered: true });
    if (bulkResult.modifiedCount !== orderItems.length) {
      return res.status(409).json({ message: "not enough stock for one or more items" });
    }

    if (paymentMethod === "card" && stripe) {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: env.stripeCurrency,
        metadata: {
          userId: req.user!.id,
          orderUserEmail: req.user!.email,
        },
        automatic_payment_methods: { enabled: true },
      });

      stripePaymentIntentId = intent.id;
      paymentIntentClientSecret = intent.client_secret ?? undefined;
    }

    const order = new Order({
      user: req.user!.id,
      items: orderItems,
      total,
      status: "pending",
      paymentMethod,
      stripePaymentIntentId,
      shippingAddress: {
        fullName: String(shippingInput.fullName).trim(),
        phone: String(shippingInput.phone).trim(),
        addressLine1: String(shippingInput.addressLine1).trim(),
        addressLine2: shippingInput.addressLine2 ? String(shippingInput.addressLine2).trim() : undefined,
        city: String(shippingInput.city).trim(),
        country: String(shippingInput.country).trim(),
        postalCode: String(shippingInput.postalCode).trim(),
      },
      statusHistory: [
        {
          status: "pending",
          at: new Date(),
          note: "Order placed",
        },
      ],
    });

    await order.save();
    res.status(201).json({ order, paymentIntentClientSecret });
  } catch (err) {
    console.error("Create order error", err);
    res.status(500).json({ message: "failed to create order" });
  }
});

router.get("/", authRequired, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ orders });
  } catch (err) {
    console.error("List orders error", err);
    res.status(500).json({ message: "failed to list orders" });
  }
});

router.get("/all", authRequired, requireRole("admin"), async (_req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json({ orders });
  } catch (err) {
    console.error("Admin list orders error", err);
    res.status(500).json({ message: "failed to list orders" });
  }
});

router.patch("/:id/status", authRequired, requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "invalid order id" });
  }

  if (!status || !allowedStatuses.includes(status as AllowedStatus)) {
    return res.status(400).json({ message: "invalid status" });
  }

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    const nextStatus = status as AllowedStatus;
    if (!transitions[order.status as AllowedStatus].includes(nextStatus)) {
      return res.status(400).json({ message: `cannot move from ${order.status} to ${nextStatus}` });
    }

    order.status = nextStatus;
    if (nextStatus === "paid") {
      order.paidAt = order.paidAt || new Date();
      order.paymentMethod = (order.paymentMethod || "cod") as AllowedPaymentMethod;
    }
    order.statusHistory.push({ status: nextStatus, at: new Date(), note: `Admin set to ${nextStatus}` });
    await order.save();
    res.json({ order });
  } catch (err) {
    console.error("Update order status error", err);
    res.status(500).json({ message: "failed to update order status" });
  }
});

router.post("/:id/pay", authRequired, async (req, res) => {
  const { id } = req.params;
  const method: AllowedPaymentMethod = allowedPaymentMethods.includes(req.body?.paymentMethod)
    ? (req.body.paymentMethod as AllowedPaymentMethod)
    : "card";

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "invalid order id" });
  }

  try {
    const order = await Order.findOne({ _id: id, user: req.user!.id });
    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: `cannot pay order in status ${order.status}` });
    }

    if (order.paymentMethod === "cod" && method === "cod") {
      // COD cannot be "paid" via this endpoint
      return res.status(400).json({ message: "cash on delivery orders remain pending" });
    }

    if (!stripe || !order.stripePaymentIntentId) {
      return res.status(400).json({ message: "card payment not available for this order" });
    }

    const intent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
    if (intent.status !== "succeeded") {
      return res.status(400).json({ message: `payment intent not successful (${intent.status})` });
    }

    order.paymentMethod = "card";
    order.status = "paid";
    order.paidAt = new Date(intent.created * 1000);
    order.statusHistory.push({ status: "paid", at: order.paidAt, note: "Payment succeeded" });
    await order.save();

    res.json({ order });
  } catch (err) {
    console.error("Pay order error", err);
    res.status(500).json({ message: "failed to pay order" });
  }
});

export default router;
