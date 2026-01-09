import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { formatCurrency } from "../lib/currency";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";

type Product = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  isFeatured: boolean;
};

type ProductsResponse = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

const imageFiles = [
  "airpod1.webp",
  "airpods2.webp",
  "airpods3.webp",
  "airpods4.webp",
  "airpods5.webp",
  "airpods6.webp",
  "beats1.webp",
  "beats3.webp",
  "beats4.webp",
  "beats5.webp",
  "beats6.webp",
  "beats7.webp",
  "beats8.webp",
  "cam1.webp",
  "cam2.webp",
  "cam3.webp",
  "cam4.webp",
  "cam5.webp",
  "cam6.webp",
  "charger1.webp",
  "charger2.webp",
  "charger3.webp",
  "charger4.webp",
  "charger5.webp",
  "pc1.webp",
  "pc2.webp",
  "pc3.webp",
  "pc4.webp",
  "pc5.webp",
  "pc6.webp",
  "pc7.webp",
  "phone1.webp",
  "phone2.webp",
  "phone3.webp",
  "phone4.webp",
  "phone5.webp",
  "phone6.webp",
  "speakers10.webp",
  "speakers11.webp",
  "speakers2.webp",
  "speakers3.webp",
  "speakers4.webp",
  "speakers5.webp",
  "speakers6.webp",
  "speakers7.webp",
  "speakers8.webp",
  "speakers9.webp",
  "speaners1.webp",
  "usb1.webp",
  "usb2.webp",
  "usb3.webp",
  "usb4.webp",
  "usb5.webp",
  "usb6.webp",
  "usb7.webp",
  "watch1.webp",
  "watch2.webp",
  "watch3.webp",
  "watch4.webp",
  "watch5.webp",
  "watch6.webp",
  "watch7.webp",
];

function formatName(file: string) {
  const base = file.replace(/\.[^.]+$/, "");
  return base
    .replace(/[-_]+/g, " ")
    .replace(/(\d+)/g, " $1")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function imageUrl(file: string) {
  // Served from frontend/public/product-images after copy
  return `/product-images/${file}`;
}

export function Products() {
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<ProductsResponse>("/api/products?page=1&limit=100");
        if (!cancelled) setProducts(data.items);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load products";
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

  const galleryItems = useMemo(() => {
    if (!products.length) return [] as Array<Product & { imageFile: string; displayName: string }>;
    return imageFiles.map((file, idx) => {
      const product = products[idx % products.length];
      const displayName = formatName(file);
      return {
        ...product,
        imageFile: file,
        displayName,
      };
    });
  }, [products]);

  function handleAddToCart(item: Product & { displayName: string }) {
    addItem({
      productId: item._id,
      title: item.displayName,
      price: item.price,
      quantity: 1,
      stock: item.stock,
    });
    addToast({ message: `${item.displayName} added to cart`, type: "success" });
  }

  return (
    <div className="rounded-2xl p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Gallery</h1>
        </div>
        <span className="badge badge-outline">{galleryItems.length} items</span>
      </div>

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
        ) : galleryItems.length === 0 ? (
          <div className="text-sm text-base-content/70">No products available.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {galleryItems.map((item) => (
              <article
                key={item._id}
                className="card border border-base-300 bg-base-100 shadow-sm text-sm transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <figure className="aspect-video overflow-hidden bg-base-200">
                  <img
                    src={imageUrl(item.imageFile)}
                    alt={item.displayName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </figure>
                <div className="card-body gap-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="card-title text-base leading-tight">{item.displayName}</div>
                    {item.isFeatured && <span className="badge badge-secondary">Featured</span>}
                  </div>
                  <p className="text-xs text-base-content/70 line-clamp-2">Handpicked from your product images folder.</p>
                  <div className="flex items-center justify-between text-sm text-base-content">
                    <span className="font-semibold">{formatCurrency(item.price)}</span>
                    <span className="flex items-center gap-2 text-xs text-base-content/70">
                      Stock: {item.stock}
                      {item.stock > 0 && item.stock <= 3 && <span className="badge badge-warning badge-xs">Low</span>}
                      {item.stock === 0 && <span className="badge badge-neutral badge-xs">Out</span>}
                    </span>
                  </div>
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={item.stock === 0}
                      onClick={() => handleAddToCart(item)}
                    >
                      {item.stock === 0 ? "Out of stock" : "Add to cart"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
