import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/currency";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";

const requiredFields = ["fullName", "phone", "addressLine1", "city", "country", "postalCode"] as const;

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = loadStripe(stripePublishableKey);

function CheckoutForm() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const addToast = useToastStore((s) => s.addToast);
  const stripe = useStripe();
  const elements = useElements();

  const [shipping, setShipping] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);

  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    return { subtotal, totalItems };
  }, [items]);

  useEffect(() => {
    if (!items.length) navigate("/cart", { replace: true });
  }, [items.length, navigate]);

  useEffect(() => {
    if (paymentMethod === "cod") {
      setPendingOrderId(null);
      setPaymentClientSecret(null);
    }
  }, [paymentMethod]);

  const invalidField = requiredFields.find((key) => !shipping[key]);

  function updateField(key: keyof typeof shipping, value: string) {
    setShipping((prev) => ({ ...prev, [key]: value }));
  }

  async function confirmCardPayment(orderId: string, clientSecret: string) {
    if (!stripe || !elements) {
      setError("Payment form not ready. Please wait a moment and try again.");
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      setError("Card input unavailable. Reload and try again.");
      return;
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: {
          name: shipping.fullName || user?.name || user?.email || "Customer",
          email: user?.email,
          phone: shipping.phone || undefined,
        },
      },
    });

    if (stripeError) {
      setError(stripeError.message || "Card payment failed");
      return;
    }

    if (!paymentIntent || paymentIntent.status !== "succeeded") {
      setError(`Payment not completed (status: ${paymentIntent?.status || "unknown"}).`);
      return;
    }

    await api.post<{ order: { _id: string } }>(`/api/orders/${orderId}/pay`, { paymentMethod: "card" });
    clearCart();
    addToast({ message: "Payment successful", type: "success" });
    navigate("/orders");
  }

  async function placeOrder() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!items.length) return;
    if (invalidField) {
      setError(`Please enter ${invalidField.replace(/([A-Z])/g, " $1").toLowerCase()}`);
      return;
    }

    if (paymentMethod === "card" && !stripePublishableKey) {
      setError("Card payments are not configured. Please choose cash on delivery.");
      return;
    }

    setError(null);
    setPlacing(true);

    try {
      // Revalidate stock client-side before placing order
      const stockChecks = await Promise.all(
        items.map(async (item) => {
          const data = await api.get<{ product: { stock?: number; title: string } }>(`/api/products/${item.productId}`);
          return { id: item.productId, stock: data.product.stock ?? 0, title: data.product.title };
        })
      );

      const insufficient = stockChecks.find((p) => p.stock < items.find((i) => i.productId === p.id)!.quantity);
      if (insufficient) {
        const msg = `Not enough stock for ${insufficient.title}. Available: ${insufficient.stock}`;
        setError(msg);
        addToast({ message: msg, type: "error" });
        return;
      }

      // If we already created an order for a card attempt, reuse it for retries
      if (paymentMethod === "card" && pendingOrderId && paymentClientSecret) {
        await confirmCardPayment(pendingOrderId, paymentClientSecret);
        return;
      }

      const payload = {
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        paymentMethod,
        shippingAddress: shipping,
      };

      const { order, paymentIntentClientSecret } = await api.post<{
        order: { _id: string };
        paymentIntentClientSecret?: string;
      }>("/api/orders", payload);

      if (paymentMethod === "cod") {
        clearCart();
        addToast({ message: "Order placed (COD)", type: "success" });
        navigate("/orders");
        return;
      }

      if (!paymentIntentClientSecret) {
        setError("Unable to start card payment. Please try again.");
        return;
      }

      setPendingOrderId(order._id);
      setPaymentClientSecret(paymentIntentClientSecret);
      await confirmCardPayment(order._id, paymentIntentClientSecret);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      setError(msg);
      addToast({ message: msg, type: "error" });
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-base-content/70">Enter your shipping details and review your order.</p>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Shipping address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="form-control w-full sm:col-span-2">
              <span className="label-text">Full name</span>
              <input
                className="input input-bordered"
                value={shipping.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                placeholder="Jane Doe"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text">Phone</span>
              <input
                className="input input-bordered"
                value={shipping.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+1 555 555 5555"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text">Country</span>
              <input
                className="input input-bordered"
                value={shipping.country}
                onChange={(e) => updateField("country", e.target.value)}
                placeholder="Country"
              />
            </label>
            <label className="form-control w-full sm:col-span-2">
              <span className="label-text">Address line 1</span>
              <input
                className="input input-bordered"
                value={shipping.addressLine1}
                onChange={(e) => updateField("addressLine1", e.target.value)}
                placeholder="123 Market St"
              />
            </label>
            <label className="form-control w-full sm:col-span-2">
              <span className="label-text">Address line 2 (optional)</span>
              <input
                className="input input-bordered"
                value={shipping.addressLine2}
                onChange={(e) => updateField("addressLine2", e.target.value)}
                placeholder="Apartment, suite, etc."
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text">City</span>
              <input
                className="input input-bordered"
                value={shipping.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="City"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text">Postal code</span>
              <input
                className="input input-bordered"
                value={shipping.postalCode}
                onChange={(e) => updateField("postalCode", e.target.value)}
                placeholder="Zip / Postal"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Payment method</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-3 rounded-xl border border-base-300 bg-base-200/60 px-3 py-2">
              <input
                type="radio"
                name="payment"
                className="radio mt-1"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              <div className="text-sm w-full">
                <div className="font-semibold flex items-center justify-between">
                  <span>Card (Stripe test)</span>
                  {!stripePublishableKey && <span className="badge badge-outline badge-error">Not configured</span>}
                </div>
                <div className="text-xs text-base-content/70">Secure payment via Stripe. Use 4242 4242 4242 4242, any future expiry, any CVC.</div>
                {paymentMethod === "card" && (
                  <div className="mt-3 rounded-lg border border-base-300 bg-base-100 p-3">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            color: "inherit",
                            fontSize: "16px",
                            "::placeholder": { color: "#9ca3af" },
                          },
                        },
                      }}
                    />
                  </div>
                )}
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-200/60 px-3 py-2">
              <input
                type="radio"
                name="payment"
                className="radio"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <div className="text-sm">
                <div className="font-semibold">Cash on delivery</div>
                <div className="text-xs text-base-content/70">Order stays pending until fulfilled.</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Order review</h2>
          <span className="badge badge-outline">{totals.totalItems} item(s)</span>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between rounded-lg border border-base-300 bg-base-200/60 px-3 py-2 text-sm">
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-base-content/70">Qty {item.quantity} · {formatCurrency(item.price)}</div>
              </div>
              <div className="font-semibold">{formatCurrency(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        <div className="divider my-4" />
        <div className="space-y-2 text-sm text-base-content/80">
          <div className="flex items-center justify-between">
            <span>Items</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span className="text-success">Included</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-base-content">
            <span>Total</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-error">{error}</p>}

        <button className="btn btn-primary mt-6 w-full" onClick={placeOrder} disabled={placing || !items.length}>
          {placing ? "Processing..." : paymentMethod === "card" ? "Pay now" : "Place order"}
        </button>
        <p className="mt-2 text-xs text-base-content/60">Orders will be saved to your account for tracking.</p>
      </div>
    </div>
  );
}

export function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
