import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";

export function Cart() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

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
                <p className="text-sm text-base-content/70">${item.price.toFixed(2)}</p>
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
                  <button className="btn join-item" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                    +
                  </button>
                </div>

                <span className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>

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
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span className="text-success">Included</span>
          </div>
          <div className="divider my-2"></div>
          <div className="flex items-center justify-between text-base font-semibold text-base-content">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>

        <button className="btn btn-primary mt-6 w-full" disabled>
          Checkout (coming soon)
        </button>
        <p className="mt-2 text-xs text-base-content/60">Checkout flow will post an order once backend support is added.</p>
      </div>
    </div>
  );
}
