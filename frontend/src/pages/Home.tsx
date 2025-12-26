import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const heroProducts = [
  {
    title: "Noise-Canceling Headphones",
    price: "$249",
    badge: "Bestseller",
    blurb: "Immersive sound with 35h battery and adaptive EQ.",
  },
  {
    title: "4K OLED TV",
    price: "$1,299",
    badge: "New",
    blurb: "Ultra-thin design with vivid HDR and 120Hz refresh.",
  },
  {
    title: "Smartwatch",
    price: "$299",
    badge: "Trending",
    blurb: "Health tracking, GPS, and 7-day battery life.",
  },
];

export function Home() {
  return (
    <>
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl bg-gradient-to-br from-primary/15 via-base-100 to-secondary/10 p-[1px] shadow-lg">
          <div className="rounded-2xl bg-base-100 p-8 sm:p-10">
            <p className="badge badge-primary badge-lg mb-4">Electronics</p>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              Shop the latest electronics with <span className="text-primary">fast</span> delivery & flexible payments.
            </h1>
            <p className="mt-4 text-base text-base-content/80 sm:text-lg">
              Curated gadgets, transparent pricing, and a checkout experience inspired by Amazon and Shopify—built for learning.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" className="btn btn-primary btn-lg">
                Browse products
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link to="/cart" className="btn btn-ghost btn-lg">
                View cart
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {["Secure checkout", "24/7 support", "Easy returns"].map((item) => (
                <div key={item} className="rounded-xl border border-base-300 bg-base-200/60 p-4 text-sm font-medium">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Featured picks</h2>
            <Link to="/products" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {heroProducts.map((item) => (
              <article key={item.title} className="card border border-base-300 bg-base-100 shadow-sm">
                <div className="card-body">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-secondary">{item.badge}</span>
                    <span className="text-xs text-base-content/70">{item.price}</span>
                  </div>
                  <h3 className="card-title text-xl">{item.title}</h3>
                  <p className="text-sm text-base-content/80">{item.blurb}</p>
                  <div className="card-actions justify-end">
                    <button className="btn btn-outline btn-sm">Add to cart</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-8 shadow-sm">
        <h2 className="text-xl font-semibold">Learning roadmap</h2>
        <p className="mt-2 text-sm text-base-content/80">
          We will iteratively add auth, products, cart, checkout, payments, orders, and an admin dashboard. Each step will come with explanations and code walk-throughs.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {["Auth + JWT", "Product listing/search", "Cart + checkout", "Payments", "Orders", "Admin CRUD"].map((label) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-200/60 px-4 py-3 text-sm font-medium"
            >
              <span className="h-2 w-2 rounded-full bg-primary"></span>
              {label}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
