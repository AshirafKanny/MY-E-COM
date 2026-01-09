import Stripe from "stripe";
import { env } from "../config/env.js";

const apiVersion: Stripe.StripeConfig["apiVersion"] = "2024-06-20";

export const stripe = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey, { apiVersion })
  : null;
