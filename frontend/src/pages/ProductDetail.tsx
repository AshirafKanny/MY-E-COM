import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/currency";
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

type ProductResponse = {
  product: Product;
};

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<ProductResponse>(`/api/products/${id}`);
        if (!cancelled) setProduct(data.product);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load product";
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
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: 1,
      stock: product.stock,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-base-content/70">
        <span className="loading loading-spinner loading-sm" />
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-2 text-base-content/80">{error || "We could not find this product."}</p>
        <Link to="/products" className="btn btn-primary mt-4">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-8 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{product.title}</h1>
            {product.isFeatured && <span className="badge badge-secondary">Featured</span>}
          </div>
          {product.category && <p className="text-xs uppercase text-base-content/60">{product.category}</p>}
          <p className="text-base text-base-content/80">{product.description || "No description available."}</p>
          <div className="text-2xl font-semibold text-base-content">{formatCurrency(product.price)}</div>
          <div className="text-sm text-base-content/70">Stock: {product.stock ?? 0}</div>
          {product.stock > 0 && product.stock <= 3 && (
            <div className="badge badge-warning badge-sm">Low stock</div>
          )}
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={handleAddToCart} disabled={product.stock === 0}>
              {product.stock === 0 ? "Out of stock" : "Add to cart"}
            </button>
            <Link to="/products" className="btn btn-ghost">
              Back to products
            </Link>
          </div>
        </div>
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-56 w-56 rounded-xl border border-base-300 object-cover"
          />
        ) : (
          <div className="flex h-56 w-56 items-center justify-center rounded-xl border border-dashed border-base-300 text-sm text-base-content/60">
            No image
          </div>
        )}
      </div>
    </div>
  );
}
