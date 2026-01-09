import { Link, useParams } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useToastStore } from "../store/toastStore";

const categoryContent: Record<
  string,
  {
    title: string;
    blurb: string;
    items: Array<{ name: string; note: string; price?: number; stock?: number }>;
  }
> = {
  "electronic-gadgets": {
    title: "Electronic Gadgets",
    blurb: "Latest devices, smart accessories, and everyday tech essentials.",
    items: [
      { name: "Wireless Earbuds", note: "Noise cancellation and 24h playtime.", price: 249000, stock: 14 },
      { name: "Smartphone G Pro", note: "120Hz display with flagship camera.", price: 1899000, stock: 8 },
      { name: "Tablet Air", note: "Slim metal body, stylus-ready.", price: 1399000, stock: 12 },
      { name: "Portable Speaker", note: "Water-resistant with deep bass.", price: 329000, stock: 20 },
      { name: "Action Camera", note: "4K60 capture, wide dynamic range.", price: 899000, stock: 10 },
    ],
  },
  "home-living": {
    title: "Home & Living",
    blurb: "Comfort picks for your living room, kitchen, and workspace.",
    items: [
      { name: "Cozy Throw", note: "Soft knit, machine washable.", price: 89000, stock: 18 },
      { name: "Ceramic Mug Set", note: "Minimal, stackable, 350ml.", price: 59000, stock: 24 },
      { name: "Desk Lamp", note: "Dimmable warm/white modes.", price: 129000, stock: 15 },
      { name: "Aroma Diffuser", note: "Quiet mist with auto-off.", price: 99000, stock: 14 },
      { name: "Wall Shelf", note: "Floating style, oak finish.", price: 149000, stock: 9 },
    ],
  },
  "fashion-apparel": {
    title: "Fashion & Apparel",
    blurb: "Fresh fits, versatile basics, and seasonal standouts.",
    items: [
      { name: "Graphic Tee", note: "Premium cotton, relaxed cut.", price: 69000, stock: 30 },
      { name: "Denim Jacket", note: "Mid-wash, soft feel lining.", price: 199000, stock: 12 },
      { name: "Athletic Sneakers", note: "Lightweight with breathable mesh.", price: 259000, stock: 16 },
      { name: "Everyday Tote", note: "Canvas with inner pocket.", price: 79000, stock: 22 },
      { name: "Beanie", note: "Rib knit, unisex fit.", price: 49000, stock: 28 },
    ],
  },
  "beauty-personal-care": {
    title: "Beauty & Personal Care",
    blurb: "Self-care staples for skin, hair, and daily rituals.",
    items: [
      { name: "Hydrating Serum", note: "Hyaluronic + niacinamide.", price: 69000, stock: 12 },
      { name: "Satin Scrunchies", note: "Gentle on hair, pack of 3.", price: 39000, stock: 18 },
      { name: "Face Cleanser", note: "pH-balanced, fragrance-free.", price: 49000, stock: 20 },
      { name: "Body Butter", note: "Shea-based, deep moisture.", price: 59000, stock: 9 },
      { name: "Lip Balm Duo", note: "SPF and overnight care.", price: 29000, stock: 25 },
    ],
  },
  "sports-fitness": {
    title: "Sports & Fitness",
    blurb: "Gear to train, recover, and stay active indoors or out.",
    items: [
      { name: "Yoga Mat", note: "Non-slip, 6mm cushioning.", price: 79000, stock: 20 },
      { name: "Resistance Bands", note: "Set of 5, progressive load.", price: 59000, stock: 25 },
      { name: "Stainless Bottle", note: "Insulated, 750ml.", price: 69000, stock: 30 },
      { name: "Jump Rope", note: "Adjustable, ball bearing handles.", price: 39000, stock: 18 },
      { name: "Foam Roller", note: "Medium density for recovery.", price: 99000, stock: 14 },
    ],
  },
  "books-education-stationery": {
    title: "Books, Education & Stationery",
    blurb: "Study aids, journals, and tools for lifelong learning.",
    items: [
      { name: "Dot Grid Notebook", note: "Hardcover, 120gsm pages.", price: 49000, stock: 26 },
      { name: "Color Gel Pens", note: "Smooth ink, 10-pack.", price: 29000, stock: 40 },
      { name: "Productivity Planner", note: "Weekly layouts with goals.", price: 69000, stock: 18 },
      { name: "Desk Organizer", note: "Modular trays, matte finish.", price: 99000, stock: 12 },
      { name: "Non-Fiction Pick", note: "Bestseller on creativity.", price: 79000, stock: 15 },
    ],
  },
};

const electronicImages = [
  "cam1.webp",
  "phone3.webp",
  "watch3.webp",
  "speakers7.webp",
  "pc3.webp",
];

const beautyImages = [
  "beauty P1.webp",
  "beauty p2.jpg",
  "beauty p3.jpg",
  "beauty p4.jpg",
  "beauty p5.jpg",
];

const homeLivingImages = [
  "home1.jpeg",
  "home 2.jpeg",
  "home 3.jpeg",
  "home 4.jpeg",
  "home 5.jpeg",
];

const sportsImages = [
  "watch6.webp",
  "watch7.webp",
  "beats6.webp",
  "phone4.webp",
  "cam4.webp",
];

const fashionImages = [
  "watch2.webp",
  "watch5.webp",
  "phone6.webp",
  "beats4.webp",
  "airpods2.webp",
];

const booksImages = [
  "pc1.webp",
  "pc4.webp",
  "usb2.webp",
  "charger5.webp",
  "speakers5.webp",
];

function imageUrl(file: string) {
  return `/product-images/${file}`;
}

function toId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  const data = slug ? categoryContent[slug] : undefined;
  const isElectronicGadgets = slug === "electronic-gadgets";
  const isBeauty = slug === "beauty-personal-care";
  const isHomeLiving = slug === "home-living";
  const isSports = slug === "sports-fitness";
  const isFashion = slug === "fashion-apparel";
  const isBooks = slug === "books-education-stationery";

  if (!data) {
    return (
      <div className="space-y-4 rounded-2xl border border-base-300 bg-base-100/70 p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <p className="text-base-content/70">The category you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary btn-sm w-fit">Back to home</Link>
      </div>
    );
  }

  if (isElectronicGadgets) {
    return (
      <div className="space-y-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{data.title}</h1>
            <p className="text-base-content/70">{data.blurb}</p>
          </div>
          <span className="badge badge-outline">{data.items.length} items</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.items.map((item, idx) => (
            <article
              key={item.name}
              className="card border border-base-300 bg-base-100 shadow-sm text-sm transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <figure className="aspect-video overflow-hidden bg-base-200">
                <img
                  src={imageUrl(electronicImages[idx % electronicImages.length])}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </figure>
              <div className="card-body gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="card-title text-base leading-tight">{item.name}</div>
                  <span className="badge badge-secondary">Featured</span>
                </div>
                <p className="text-xs text-base-content/70 line-clamp-2">{item.note}</p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={(item.stock ?? 0) === 0}
                    onClick={() => {
                      const price = item.price ?? 0;
                      const stock = item.stock ?? 0;
                      if (stock === 0) return;
                      addItem({
                        productId: `electronics-${toId(item.name)}`,
                        title: item.name,
                        price,
                        quantity: 1,
                        stock,
                      });
                      addToast({ message: `${item.name} added to cart`, type: "success" });
                    }}
                  >
                    {(item.stock ?? 0) === 0 ? "Out of stock" : "Add to cart"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/products" className="btn btn-outline btn-sm">Go to all products</Link>
          <Link to="/" className="btn btn-ghost btn-sm">Back home</Link>
        </div>
      </div>
    );
  }

  if (isBeauty) {
    return (
      <div className="space-y-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{data.title}</h1>
            <p className="text-base-content/70">{data.blurb}</p>
          </div>
          <span className="badge badge-outline">{data.items.length} items</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.items.map((item, idx) => (
            <article
              key={item.name}
              className="card border border-base-300 bg-base-100 shadow-sm text-sm transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <figure className="aspect-video overflow-hidden bg-base-200">
                <img
                  src={imageUrl(beautyImages[idx % beautyImages.length])}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </figure>
              <div className="card-body gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="card-title text-base leading-tight">{item.name}</div>
                  <span className="badge badge-secondary">Featured</span>
                </div>
                <p className="text-xs text-base-content/70 line-clamp-2">{item.note}</p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={(item.stock ?? 0) === 0}
                    onClick={() => {
                      const price = item.price ?? 0;
                      const stock = item.stock ?? 0;
                      if (stock === 0) return;
                      addItem({
                        productId: `beauty-${toId(item.name)}`,
                        title: item.name,
                        price,
                        quantity: 1,
                        stock,
                      });
                      addToast({ message: `${item.name} added to cart`, type: "success" });
                    }}
                  >
                    {(item.stock ?? 0) === 0 ? "Out of stock" : "Add to cart"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/products" className="btn btn-outline btn-sm">Go to all products</Link>
          <Link to="/" className="btn btn-ghost btn-sm">Back home</Link>
        </div>
      </div>
    );
  }

  if (isHomeLiving) {
    return (
      <div className="space-y-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{data.title}</h1>
            <p className="text-base-content/70">{data.blurb}</p>
          </div>
          <span className="badge badge-outline">{data.items.length} items</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.items.map((item, idx) => (
            <article
              key={item.name}
              className="card border border-base-300 bg-base-100 shadow-sm text-sm transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <figure className="aspect-video overflow-hidden bg-base-200">
                <img
                  src={imageUrl(homeLivingImages[idx % homeLivingImages.length])}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </figure>
              <div className="card-body gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="card-title text-base leading-tight">{item.name}</div>
                  <span className="badge badge-secondary">Featured</span>
                </div>
                <p className="text-xs text-base-content/70 line-clamp-2">{item.note}</p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={(item.stock ?? 0) === 0}
                    onClick={() => {
                      const price = item.price ?? 0;
                      const stock = item.stock ?? 0;
                      if (stock === 0) return;
                      addItem({
                        productId: `home-${toId(item.name)}`,
                        title: item.name,
                        price,
                        quantity: 1,
                        stock,
                      });
                      addToast({ message: `${item.name} added to cart`, type: "success" });
                    }}
                  >
                    {(item.stock ?? 0) === 0 ? "Out of stock" : "Add to cart"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/products" className="btn btn-outline btn-sm">Go to all products</Link>
          <Link to="/" className="btn btn-ghost btn-sm">Back home</Link>
        </div>
      </div>
    );
  }

  if (isSports) {
    return (
      <div className="space-y-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{data.title}</h1>
            <p className="text-base-content/70">{data.blurb}</p>
          </div>
          <span className="badge badge-outline">{data.items.length} items</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.items.map((item, idx) => (
            <article
              key={item.name}
              className="card border border-base-300 bg-base-100 shadow-sm text-sm transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <figure className="aspect-video overflow-hidden bg-base-200">
                <img
                  src={imageUrl(sportsImages[idx % sportsImages.length])}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </figure>
              <div className="card-body gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="card-title text-base leading-tight">{item.name}</div>
                  <span className="badge badge-secondary">Featured</span>
                </div>
                <p className="text-xs text-base-content/70 line-clamp-2">{item.note}</p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={(item.stock ?? 0) === 0}
                    onClick={() => {
                      const price = item.price ?? 0;
                      const stock = item.stock ?? 0;
                      if (stock === 0) return;
                      addItem({
                        productId: `sports-${toId(item.name)}`,
                        title: item.name,
                        price,
                        quantity: 1,
                        stock,
                      });
                      addToast({ message: `${item.name} added to cart`, type: "success" });
                    }}
                  >
                    {(item.stock ?? 0) === 0 ? "Out of stock" : "Add to cart"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/products" className="btn btn-outline btn-sm">Go to all products</Link>
          <Link to="/" className="btn btn-ghost btn-sm">Back home</Link>
        </div>
      </div>
    );
  }

  if (isFashion) {
    return (
      <div className="space-y-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{data.title}</h1>
            <p className="text-base-content/70">{data.blurb}</p>
          </div>
          <span className="badge badge-outline">{data.items.length} items</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.items.map((item, idx) => (
            <article
              key={item.name}
              className="card border border-base-300 bg-base-100 shadow-sm text-sm transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <figure className="aspect-video overflow-hidden bg-base-200">
                <img
                  src={imageUrl(fashionImages[idx % fashionImages.length])}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </figure>
              <div className="card-body gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="card-title text-base leading-tight">{item.name}</div>
                  <span className="badge badge-secondary">Featured</span>
                </div>
                <p className="text-xs text-base-content/70 line-clamp-2">{item.note}</p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={(item.stock ?? 0) === 0}
                    onClick={() => {
                      const price = item.price ?? 0;
                      const stock = item.stock ?? 0;
                      if (stock === 0) return;
                      addItem({
                        productId: `fashion-${toId(item.name)}`,
                        title: item.name,
                        price,
                        quantity: 1,
                        stock,
                      });
                      addToast({ message: `${item.name} added to cart`, type: "success" });
                    }}
                  >
                    {(item.stock ?? 0) === 0 ? "Out of stock" : "Add to cart"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/products" className="btn btn-outline btn-sm">Go to all products</Link>
          <Link to="/" className="btn btn-ghost btn-sm">Back home</Link>
        </div>
      </div>
    );
  }

  if (isBooks) {
    return (
      <div className="space-y-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{data.title}</h1>
            <p className="text-base-content/70">{data.blurb}</p>
          </div>
          <span className="badge badge-outline">{data.items.length} items</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.items.map((item, idx) => (
            <article
              key={item.name}
              className="card border border-base-300 bg-base-100 shadow-sm text-sm transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
            >
              <figure className="aspect-video overflow-hidden bg-base-200">
                <img
                  src={imageUrl(booksImages[idx % booksImages.length])}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </figure>
              <div className="card-body gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="card-title text-base leading-tight">{item.name}</div>
                  <span className="badge badge-secondary">Featured</span>
                </div>
                <p className="text-xs text-base-content/70 line-clamp-2">{item.note}</p>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={(item.stock ?? 0) === 0}
                    onClick={() => {
                      const price = item.price ?? 0;
                      const stock = item.stock ?? 0;
                      if (stock === 0) return;
                      addItem({
                        productId: `books-${toId(item.name)}`,
                        title: item.name,
                        price,
                        quantity: 1,
                        stock,
                      });
                      addToast({ message: `${item.name} added to cart`, type: "success" });
                    }}
                  >
                    {(item.stock ?? 0) === 0 ? "Out of stock" : "Add to cart"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/products" className="btn btn-outline btn-sm">Go to all products</Link>
          <Link to="/" className="btn btn-ghost btn-sm">Back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white drop-shadow">{data.title}</h1>
        <p className="text-base-content/80 text-sm sm:text-base">{data.blurb}</p>
        <div className="flex flex-wrap gap-2 text-xs text-base-content/60">
          <span className="badge badge-secondary">Curated picks</span>
          <span className="badge badge-outline">Dummy data</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item) => (
          <article
            key={item.name}
            className="card h-full border border-white/25 bg-white/15 backdrop-blur-md shadow-md text-base-content"
          >
            <div className="card-body space-y-2">
              <h3 className="card-title text-lg text-white">{item.name}</h3>
              <p className="text-sm text-base-content/80">{item.note}</p>
              <div className="card-actions justify-end">
                <button className="btn btn-sm btn-primary">View</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/products" className="btn btn-outline btn-sm">Go to all products</Link>
        <Link to="/" className="btn btn-ghost btn-sm">Back home</Link>
      </div>
    </div>
  );
}
