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
  statusHistory?: {
    status: string;
    at: string;
    note?: string;
  }[];
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
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

  function renderTimeline(order: Order) {
    const history = (order.statusHistory || []).slice().sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    if (!history.length) return null;

    return (
      <div className="mt-3 rounded-lg border border-base-300 bg-base-100 p-3 text-xs text-base-content/80">
        <div className="mb-2 font-semibold text-base-content">Status history</div>
        <ol className="space-y-2">
          {history.map((h, idx) => (
            <li key={`${h.status}-${idx}`} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden />
              <div>
                <div className="flex items-center gap-2">
                  <span className={statusStyle(h.status)}>{h.status}</span>
                  <span className="text-[11px] text-base-content/60">{new Date(h.at).toLocaleString()}</span>
                </div>
                {h.note && <div className="text-[11px] text-base-content/70">{h.note}</div>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  function latestUpdate(order: Order) {
    const history = order.statusHistory || [];
    const last = history[history.length - 1];
    return last?.at || order.createdAt;
  }

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
              <span className="text-[11px] text-base-content/60">Last update: {new Date(latestUpdate(order)).toLocaleString()}</span>
            </div>
            <div className="text-xs text-base-content/70">
              Payment: {order.paymentMethod || "-"}
              {order.paidAt ? ` · Paid at ${new Date(order.paidAt).toLocaleString()}` : ""}
            </div>
            {order.shippingAddress && (
              <div className="mt-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-xs text-base-content/80">
                <div className="font-semibold text-base-content">Shipping</div>
                <div>{order.shippingAddress.fullName}</div>
                <div>{order.shippingAddress.phone}</div>
                <div>
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
                </div>
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </div>
                <div>{order.shippingAddress.country}</div>
              </div>
            )}
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
            {renderTimeline(order)}
          </article>
        ))}
      </div>
    </div>
  );
}
