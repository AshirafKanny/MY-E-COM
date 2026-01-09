import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/currency";
import { useToastStore } from "../store/toastStore";

type Product = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  stock: number;
  isFeatured: boolean;
};

type ProductsResponse = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

type CategoriesResponse = {
  categories: string[];
};

type Draft = Partial<Product>;

type Order = {
  _id: string;
  user: string;
  total: number;
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
  statusHistory?: { status: Order["status"]; at: string; note?: string }[];
  items: {
    title: string;
    quantity: number;
    price: number;
  }[];
};

type OrdersResponse = {
  orders: Order[];
};

const orderTransitions: Record<Order["status"], Order["status"][]> = {
  pending: ["pending", "paid", "cancelled"],
  paid: ["paid", "shipped", "cancelled"],
  shipped: ["shipped", "completed", "cancelled"],
  completed: ["completed"],
  cancelled: ["cancelled"],
};

function statusBadge(status: Order["status"]) {
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

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;

  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState<Draft>({ title: "", price: 0, stock: 0, isFeatured: false });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>({});
  const [saving, setSaving] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderSavingId, setOrderSavingId] = useState<string | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  const totalValue = useMemo(
    () => products.reduce((acc, p) => acc + p.price * (p.stock ?? 0), 0),
    [products]
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(pageSize));
      if (search.trim()) params.set("q", search.trim());
      if (category) params.set("category", category);
      if (sort) params.set("sort", sort);

      const data = await api.get<ProductsResponse>(`/api/products?${params.toString()}`);
      setProducts(data.items);
      setTotal(data.total);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load products";
      setError(msg);
      addToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const data = await api.get<CategoriesResponse>("/api/products/categories");
        if (!cancelled) setCategories(data.categories);
      } catch (_err) {
        /* non-blocking */
      }
    }

    loadCategories();
    loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      load();
    }, 200);
    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort, page]);

  async function loadOrders() {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await api.get<OrdersResponse>("/api/orders/all");
      setOrders(data.orders);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load orders";
      setOrdersError(msg);
      addToast({ message: msg, type: "error" });
    } finally {
      setOrdersLoading(false);
    }
  }

  function startEdit(product: Product) {
    setEditingId(product._id);
    setEditDraft({ ...product });
  }

  function resetEdit() {
    setEditingId(null);
    setEditDraft({});
  }

  async function handleUpdate(productId: string) {
    setSaving(true);
    setError(null);
    try {
      const body = {
        title: editDraft.title,
        description: editDraft.description,
        price: editDraft.price,
        image: editDraft.image,
        category: editDraft.category,
        stock: editDraft.stock,
        isFeatured: editDraft.isFeatured,
      };
      const data = await api.put<{ product: Product }>(`/api/products/${productId}`, body);
      setProducts((prev) => prev.map((p) => (p._id === productId ? data.product : p)));
      resetEdit();
      addToast({ message: "Product updated", type: "success" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update product";
      setError(msg);
      addToast({ message: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(productId: string) {
    const ok = window.confirm("Delete this product? This cannot be undone.");
    if (!ok) return;

    setSaving(true);
    setError(null);
    try {
      await api.delete(`/api/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      if (editingId === productId) resetEdit();
      addToast({ message: "Product deleted", type: "success" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete product";
      setError(msg);
      addToast({ message: msg, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const data = await api.post<{ product: Product }>("/api/products", createDraft as Record<string, unknown>);
      setProducts((prev) => [data.product, ...prev]);
      setCreateDraft({ title: "", price: 0, stock: 0, isFeatured: false });
      addToast({ message: "Product created", type: "success" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create product";
      setError(msg);
      addToast({ message: msg, type: "error" });
    } finally {
      setCreating(false);
    }
  }

  async function updateOrderStatus(orderId: string, status: Order["status"]) {
    setOrderSavingId(orderId);
    setOrdersError(null);
    try {
      const data = await api.patch<{ order: Order }>(`/api/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
      addToast({ message: "Order status updated", type: "success" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update order";
      setOrdersError(msg);
      addToast({ message: msg, type: "error" });
    } finally {
      setOrderSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-base-300 bg-base-100 p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-base-content/80">Manage products (create, update, delete).</p>
          </div>
          <div className="text-sm text-base-content/70 flex flex-col items-end">
            <span>Inventory value: {formatCurrency(totalValue)}</span>
            <span>{total} products</span>
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-error">{error}</p>}
        {loading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-base-content/70">
            <span className="loading loading-spinner loading-sm" /> Loading products...
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create product</h2>
          {creating && <span className="loading loading-spinner loading-sm text-primary" />}
        </div>
        <form className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" onSubmit={handleCreate}>
          <label className="form-control">
            <span className="label-text">Title</span>
            <input
              className="input input-bordered"
              value={createDraft.title || ""}
              onChange={(e) => setCreateDraft((d) => ({ ...d, title: e.target.value }))}
              required
              minLength={2}
            />
          </label>
          <label className="form-control">
            <span className="label-text">Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input input-bordered"
              value={createDraft.price ?? 0}
              onChange={(e) => setCreateDraft((d) => ({ ...d, price: Number(e.target.value) }))}
              required
            />
          </label>
          <label className="form-control">
            <span className="label-text">Stock</span>
            <input
              type="number"
              min="0"
              className="input input-bordered"
              value={createDraft.stock ?? 0}
              onChange={(e) => setCreateDraft((d) => ({ ...d, stock: Number(e.target.value) }))}
            />
          </label>
          <label className="form-control">
            <span className="label-text">Category</span>
            <input
              className="input input-bordered"
              value={createDraft.category || ""}
              onChange={(e) => setCreateDraft((d) => ({ ...d, category: e.target.value }))}
            />
          </label>
          <label className="form-control">
            <span className="label-text">Image URL</span>
            <input
              className="input input-bordered"
              value={createDraft.image || ""}
              onChange={(e) => setCreateDraft((d) => ({ ...d, image: e.target.value }))}
            />
          </label>
          <label className="form-control">
            <span className="label-text">Featured</span>
            <div className="flex items-center gap-3 rounded-lg border border-base-300 px-3 py-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={!!createDraft.isFeatured}
                onChange={(e) => setCreateDraft((d) => ({ ...d, isFeatured: e.target.checked }))}
              />
              <span className="text-sm">Mark as featured</span>
            </div>
          </label>
          <label className="form-control sm:col-span-2 lg:col-span-3">
            <span className="label-text">Description</span>
            <textarea
              className="textarea textarea-bordered"
              rows={2}
              value={createDraft.description || ""}
              onChange={(e) => setCreateDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <button className="btn btn-primary" type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create product"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Products</h2>
          <div className="flex items-center gap-2 text-sm">
            <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
              Refresh
            </button>
            <span className="badge badge-outline">Page {page}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="form-control">
              <span className="label-text">Search</span>
              <input
                className="input input-bordered"
                value={search}
                placeholder="Title or description"
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </label>
          </div>
          <label className="form-control">
            <span className="label-text">Category</span>
            <select
              className="select select-bordered"
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text">Sort</span>
            <select
              className="select select-bordered"
              value={sort}
              onChange={(e) => {
                setPage(1);
                setSort(e.target.value);
              }}
            >
              <option value="newest">Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="stockDesc">Stock: High to Low</option>
            </select>
          </label>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-sm text-base-content/70">
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isEditing = editingId === product._id;
                return (
                  <tr key={product._id} className="align-middle">
                    <td>
                      {isEditing ? (
                        <input
                          className="input input-bordered input-sm w-full"
                          value={editDraft.title || ""}
                          onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                        />
                      ) : (
                        <div className="font-medium">{product.title}</div>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          className="input input-bordered input-sm w-full"
                          value={editDraft.category || ""}
                          onChange={(e) => setEditDraft((d) => ({ ...d, category: e.target.value }))}
                        />
                      ) : (
                        <span className="text-sm text-base-content/70">{product.category || "-"}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input input-bordered input-sm w-28"
                          value={editDraft.price ?? 0}
                          onChange={(e) => setEditDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                        />
                      ) : (
                        <span className="font-semibold">{formatCurrency(product.price)}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          className="input input-bordered input-sm w-24"
                          value={editDraft.stock ?? 0}
                          onChange={(e) => setEditDraft((d) => ({ ...d, stock: Number(e.target.value) }))}
                        />
                      ) : (
                        <span>{product.stock ?? 0}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={!!editDraft.isFeatured}
                          onChange={(e) => setEditDraft((d) => ({ ...d, isFeatured: e.target.checked }))}
                        />
                      ) : product.isFeatured ? (
                        <span className="badge badge-secondary">Yes</span>
                      ) : (
                        <span className="badge badge-ghost">No</span>
                      )}
                    </td>
                    <td className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={() => handleUpdate(product._id)}
                            disabled={saving}
                          >
                            Save
                          </button>
                          <button className="btn btn-ghost btn-xs" onClick={resetEdit} disabled={saving}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-ghost btn-xs" onClick={() => startEdit(product)} disabled={saving}>
                            Edit
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => handleDelete(product._id)}
                            disabled={saving}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-base-content/70">
          <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </button>
          <div>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}</div>
          <button
            className="btn btn-outline btn-sm"
            disabled={page * pageSize >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Orders</h2>
          <button className="btn btn-ghost btn-sm" onClick={loadOrders} disabled={ordersLoading}>
            Refresh
          </button>
        </div>
        {ordersError && <p className="mt-3 text-sm text-error">{ordersError}</p>}
        {ordersLoading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-base-content/70">
            <span className="loading loading-spinner loading-sm" /> Loading orders...
          </div>
        )}

        <div className="mt-4 overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-sm text-base-content/70">
                <th>Order</th>
                <th>Created</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="align-middle">
                  <td>
                    <div className="font-medium">#{order._id.slice(-6)}</div>
                    <div className="text-xs text-base-content/70">Items: {order.items.length}</div>
                  </td>
                  <td className="text-sm text-base-content/70">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="font-semibold">{formatCurrency(order.total)}</td>
                  <td className="text-sm text-base-content/80">
                    <div className="font-medium uppercase">{order.paymentMethod || "-"}</div>
                    {order.paidAt && (
                      <div className="text-xs text-base-content/60">Paid {new Date(order.paidAt).toLocaleString()}</div>
                    )}
                  </td>
                  <td>
                    <div className="mb-1 flex items-center gap-2">
                      <span className={statusBadge(order.status)}>{order.status}</span>
                    </div>
                    <select
                      className="select select-bordered select-sm"
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value as Order["status"])}
                      disabled={orderSavingId === order._id}
                    >
                      {orderTransitions[order.status].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {order.statusHistory && order.statusHistory.length > 0 && (
                      <div className="mt-2 space-y-1 text-[11px] text-base-content/70">
                        {order.statusHistory
                          .slice()
                          .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
                          .slice(0, 2)
                          .map((h, idx) => (
                            <div key={`${h.status}-${idx}`} className="flex items-center gap-2">
                              <span className={statusBadge(h.status)}>{h.status}</span>
                              <span>{new Date(h.at).toLocaleString()}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </td>
                  <td>
                    {orderSavingId === order._id && <span className="loading loading-spinner loading-xs" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
