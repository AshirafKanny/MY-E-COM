import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useCartStore } from "../store/cartStore";

type Product = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  stock: number;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ProductsResponse = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export function Products() {
  const addItem = useCartStore((s) => s.addItem);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [featured, setFeatured] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (category.trim()) params.set("category", category.trim());
      if (featured) params.set("featured", "true");
      if (minPrice.trim()) params.set("minPrice", minPrice.trim());
      if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
      params.set("page", String(page));
      params.set("limit", String(pageSize));

      try {
        const data = await api.get<ProductsResponse>(`/api/products?${params.toString()}`);
        if (!cancelled) {
          setProducts(data.items);
          setTotal(data.total);
          setPage(data.page);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load products";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [search, category, featured, minPrice, maxPrice, page, pageSize]);

  function handleFiltersSubmit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setCategory("");
    setFeatured(false);
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  }

  function handleAddToCart(product: Product) {
    addItem({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: 1,
    });
  }

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-8 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-base-content/80">Search and add electronics to your cart.</p>
        </div>
        <div className="text-sm text-base-content/70">Page {page}</div>
      </div>

      <form className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={handleFiltersSubmit}>
        <label className="form-control">
          <span className="label-text">Search</span>
          <input
            className="input input-bordered"
            placeholder="Headphones, TV..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <label className="form-control">
          <span className="label-text">Category</span>
          <input
            className="input input-bordered"
            placeholder="electronics, audio..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="form-control">
            <span className="label-text">Min price</span>
            <input
              className="input input-bordered"
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="label-text">Max price</span>
            <input
              className="input input-bordered"
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </label>
        </div>

        <label className="form-control">
          <span className="label-text">Featured</span>
          <div className="flex items-center gap-3 rounded-lg border border-base-300 px-3 py-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <span className="text-sm">Only featured</span>
          </div>
        </label>

        <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4">
          <button type="submit" className="btn btn-primary btn-sm">
            Apply
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </form>

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <span className="loading loading-spinner loading-sm" />
            Loading products...
          </div>
        ) : error ? (
          <div className="alert alert-error flex items-center gap-2 text-sm">
            <span>Failed to load products.</span>
            <span className="font-semibold">{error}</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-sm text-base-content/70">No products found for these filters.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product._id} className="card border border-base-300 bg-base-100 shadow-sm">
                <div className="card-body">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="card-title text-lg">{product.title}</h3>
                    {product.isFeatured && <span className="badge badge-secondary">Featured</span>}
                  </div>
                  {product.category && <p className="text-xs uppercase text-base-content/60">{product.category}</p>}
                  <p className="text-sm text-base-content/80 line-clamp-2">{product.description || "No description."}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
                    <span className="text-xs text-base-content/60">Stock: {product.stock ?? 0}</span>
                  </div>
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? "Out of stock" : "Add to cart"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between text-sm text-base-content/70">
        <button className="btn btn-ghost btn-sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-ghost btn-sm"
          disabled={loading || page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
