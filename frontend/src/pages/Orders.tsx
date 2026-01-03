import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/currency";
import { useToastStore } from "../store/toastStore";

type Order = {
  _id: string;
  total: number;
  status: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
  items: {
    product: string;
    title: string;
    price: number;
    quantity: number;
  }[];
};

type OrdersResponse = {
  orders: Order[];
};

function statusStyle(status: string) {
  const base = "badge badge-sm";
  switch (status) {
    case "paid":
      return `${base} badge-info`;
    case "shipped":
      return `${base} badge-warning`;
    case "completed":
      return `${base} badge-success`;
    case "cancelled":
      return `${base} badge-neutral`;
    default:
      return `${base} badge-outline`;
  }
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<OrdersResponse>("/api/orders");
        if (!cancelled) setOrders(data.orders);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load orders";
          setError(msg);
          addToast({ message: msg, type: "error" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [addToast]);

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-base-content/80">Track your recent orders.</p>
        </div>
        {loading && <span className="loading loading-spinner loading-sm text-primary" />}
      </div>

      {error && <p className="mt-4 text-sm text-error">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="mt-4 text-sm text-base-content/70">No orders yet. Place one from the cart.</p>
      )}

      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <article key={order._id} className="rounded-xl border border-base-300 bg-base-200/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold">Order #{order._id.slice(-6)}</div>
              <div className="text-sm text-base-content/70">{new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <div className="mt-2 text-sm text-base-content/80 flex items-center gap-2">
              <span>Status:</span>
              <span className={statusStyle(order.status)}>{order.status}</span>
            </div>
            <div className="text-xs text-base-content/70">
              Payment: {order.paymentMethod || "-"}
              {order.paidAt ? ` · Paid at ${new Date(order.paidAt).toLocaleString()}` : ""}
            </div>
            <div className="mt-3 divide-y divide-base-300 rounded-lg border border-base-300 bg-base-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-base-content/70">Qty {item.quantity} · {formatCurrency(item.price)}</div>
                  </div>
                  <div className="font-semibold">{formatCurrency(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-base font-semibold text-base-content">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
