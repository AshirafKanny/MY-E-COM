import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/currency";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";

export function Cart() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  async function handleCheckout() {
    if (!user) {
      setError("Please log in to place an order.");
      return;
    }

    setError(null);
    setSuccess(null);
    setPlacing(true);

    try {
      // Revalidate stock client-side before placing order
      const stockChecks = await Promise.all(
        items.map(async (item) => {
          try {
            const data = await api.get<{ product: { stock?: number; title: string } }>(`/api/products/${item.productId}`);
            return { id: item.productId, stock: data.product.stock ?? 0, title: data.product.title };
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Product fetch failed";
            throw new Error(`Could not verify ${item.title}: ${msg}`);
          }
        })
      );

      const insufficient = stockChecks.find((p) => p.stock < items.find((i) => i.productId === p.id)!.quantity);
      if (insufficient) {
        setError(`Not enough stock for ${insufficient.title}. Available: ${insufficient.stock}`);
        addToast({ message: `Not enough stock for ${insufficient.title}.`, type: "error" });
        return;
      }

      const { order } = await api.post<{ order: { _id: string } }>("/api/orders", {
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        paymentMethod,
      });

      if (paymentMethod === "card") {
        await api.post<{ order: { _id: string } }>(`/api/orders/${order._id}/pay`, { paymentMethod });
      }
      clear();
      setSuccess(paymentMethod === "card" ? "Payment successful!" : "Order placed with cash on delivery.");
      addToast({
        message: paymentMethod === "card" ? "Payment successful" : "Order placed (COD)",
        type: "success",
      });
      navigate("/orders");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      setError(msg);
      addToast({ message: msg, type: "error" });
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Cart</h1>
        <p className="mt-2 text-base-content/80">Your cart is empty. Add products to begin checkout.</p>
        <Link to="/products" className="btn btn-primary mt-4">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cart</h1>
            <p className="text-base-content/70">{totalItems} item(s) in your cart.</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={clear}>
            Clear cart
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex flex-col gap-3 rounded-xl border border-base-300 bg-base-200/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-base-content/70">{formatCurrency(item.price)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="join">
                  <button
                    className="btn join-item"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="join-item flex min-w-[64px] items-center justify-center border px-3 py-2 text-sm font-medium">
                    Qty: {item.quantity}
                  </span>
                  <button
                    className="btn join-item"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={typeof item.stock === "number" && item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>

                <span className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</span>

                <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.productId)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Order summary</h2>
        <div className="mt-4 space-y-2 text-sm text-base-content/80">
          <div className="flex items-center justify-between">
            <span>Items ({totalItems})</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span className="text-success">Included</span>
          </div>
          <div className="divider my-2"></div>
          <div className="flex items-center justify-between text-base font-semibold text-base-content">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="text-sm font-medium text-base-content">Payment method</div>
          <label className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-200/60 px-3 py-2">
            <input
              type="radio"
              name="payment"
              className="radio"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
            />
            <div className="text-sm">
              <div className="font-semibold">Card (test)</div>
              <div className="text-xs text-base-content/70">Simulated payment, marks order as paid.</div>
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

        {error && <p className="mt-3 text-sm text-error">{error}</p>}
        {success && <p className="mt-3 text-sm text-success">{success}</p>}

        <button
          className="btn btn-primary mt-6 w-full"
          onClick={handleCheckout}
          disabled={placing || !items.length}
        >
          {placing ? "Placing order..." : user ? "Checkout" : "Login to checkout"}
        </button>
        <p className="mt-2 text-xs text-base-content/60">
          Orders are saved to your account. You can review them in the Orders page.
        </p>
      </div>
    </div>
  );
}
