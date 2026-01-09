import { Schema, model, Document, Types } from "mongoose";

export type OrderStatus = "pending" | "paid" | "shipped" | "completed" | "cancelled";
export type PaymentMethod = "card" | "cod";

export interface StatusHistoryEntry {
  status: OrderStatus;
  at: Date;
  note?: string;
}

export interface IOrderItem {
  product: Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId?: string;
  paidAt?: Date;
  shippingAddress: ShippingAddress;
  statusHistory: StatusHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "completed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "cod"],
      default: "cod",
    },
    stripePaymentIntentId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
    },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: ["pending", "paid", "shipped", "completed", "cancelled"], required: true },
          at: { type: Date, required: true },
          note: { type: String, trim: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Order = model<IOrder>("Order", OrderSchema);
