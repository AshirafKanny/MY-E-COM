import Stripe from "stripe";
import { env } from "../config/env.js";

const apiVersion: Stripe.StripeConfig["apiVersion"] = "2025-02-24.acacia";

export const stripe = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey, { apiVersion })
  : null;
