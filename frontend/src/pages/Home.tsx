import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeroHighlight, Highlight } from "../components/ui/hero-highlight";
import { SparklesCore } from "../components/ui/sparkles";
import { formatCurrency } from "../lib/currency";

const heroProducts = [
  {
    title: "Electronic Gadgets",
    slug: "electronic-gadgets",
    price: 249000,
    badge: "Bestseller",
    blurb:
      "Explore a wide range of innovative electronic gadgets designed to make life smarter, easier, and more connected. From the latest smart devices and accessories to everyday tech essentials",
  },
  {
    title: "Home & Living",
    slug: "home-living",
    price: 1299000,
    badge: "New",
    blurb:
      "Create a comfortable, stylish, and functional living space with our Home & Living collection. From home essentials and décor to practical household solutions, our products are designed to enhance everyday life.",
  },
  {
    title: "Fashion & Apparel",
    slug: "fashion-apparel",
    price: 299000,
    badge: "Trending",
    blurb:
      "Discover the latest trends and timeless styles in our Fashion & Apparel collection. From everyday essentials to statement pieces, our selection blends comfort, quality, and modern design. Whether you’re dressing for work",
  },
  {
    title: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    price: 69000,
    badge: "New",
    blurb:
      "Discover a carefully curated selection of beauty and personal care products designed to help you look and feel your best every day. From skincare and haircare essentials to grooming and wellness products",
  },
  {
    title: "Sports & Fitness",
    slug: "sports-fitness",
    price: 119000,
    badge: "Hot",
    blurb:
      "Stay active, strong, and motivated with our Sports & Fitness collection. From workout gear and fitness equipment to sports accessories and recovery essentials, our products are designed to support performance",
  },
  {
    title: "Books, Education & Stationery",
    slug: "books-education-stationery",
    price: 229000,
    badge: "Deal",
    blurb:
      "Inspire learning, creativity, and productivity with our Books, Education & Stationery collection. From educational materials and reference books to notebooks, writing tools, and study essentials, our products support learners",
  },
];

const trendingImages = [
  "cam1.webp",
  "cam2.webp",
  "speaners1.webp",
  "watch1.webp",
  "watch3.webp",
  "beats3.webp",
  "beats8.webp",
  "beats7.webp",
  "cam6.webp",
  "pc7.webp",
  "phone5.webp",
  "beats6.webp",
  "beats4.webp",
  "airpods3.webp",
  "airpod1.webp",
  "cam5.webp",
  "cam6.webp",
  "charger2.webp",
  "pc3.webp",
  "speakers2.webp",
  "speakers3.webp",
  "speakers4.webp",
  "speakers5.webp",
  "speakers7.webp",
  "speakers10.webp",
  "speakers11.webp",
] as const;

function SkeletonCard() {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-sm overflow-hidden animate-pulse">
      <div className="relative bg-base-200">
        <div className="h-36 w-full bg-gradient-to-r from-base-200 via-base-300 to-base-200" />
        <div className="card-body space-y-3">
          <div className="h-5 w-20 rounded bg-base-300" />
          <div className="h-6 w-3/4 rounded bg-base-300" />
          <div className="h-4 w-full rounded bg-base-200" />
          <div className="flex justify-end">
            <div className="h-9 w-24 rounded bg-base-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="h-full min-h-[26rem] rounded-2xl border border-base-300 bg-base-100/80 shadow-lg animate-pulse">
          <div className="w-full max-w-3xl px-6 py-10 sm:px-10 sm:py-12 space-y-5">
            <div className="h-8 w-32 rounded bg-base-300" />
            <div className="h-10 w-3/4 rounded bg-base-300" />
            <div className="h-4 w-full rounded bg-base-200" />
            <div className="h-4 w-5/6 rounded bg-base-200" />
            <div className="mt-4 flex gap-3">
              <div className="h-12 w-36 rounded bg-base-300" />
              <div className="h-12 w-28 rounded bg-base-200" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((key) => (
                <div key={key} className="h-16 rounded-xl border border-base-300 bg-base-200" />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-28 rounded bg-base-300" />
            <div className="h-8 w-16 rounded bg-base-200" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[0, 1, 2].map((key) => (
              <SkeletonCard key={key} />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm animate-pulse">
        <div className="h-8 w-48 rounded bg-base-300" />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="h-24 rounded-xl border border-base-300 bg-base-200" />
          ))}
        </div>
      </section>
    </div>
  );
}

export function Home() {
  const [loading, setLoading] = useState(true);
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  } as const;

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
  } as const;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <>
      <section
        className="relative grid gap-8 overflow-hidden rounded-3xl border border-base-300 bg-base-100 p-4 shadow-xl sm:p-6"
        style={{
          backgroundImage: "url('/payment%20methods/online%20shoppings2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/65 via-black/45 to-black/30" aria-hidden />

        <div className="relative h-full min-h-[26rem] rounded-2xl border border-base-200/60 bg-black/35 shadow-lg backdrop-blur-lg">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="w-full max-w-3xl px-6 py-10 sm:px-10 sm:py-12"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(0,0,0,0.75), rgba(0,0,0,0.35)), url('/payment%20methods/online%20shoppings2.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              borderRadius: "1rem",
            }}
          >
            <motion.p variants={fadeUp} className="badge badge-primary badge-lg mb-4 text-white">
              Electronics
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-3xl font-extrabold leading-tight text-white drop-shadow sm:text-4xl">
              Shop the latest electronics with <Highlight className="text-primary-content">fast</Highlight> delivery & flexible payments.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-4 text-base text-white/90 drop-shadow sm:text-lg">
              Curated gadgets, transparent pricing, and a checkout experience inspired by Amazon and Shopify—built for learning.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" className="btn btn-primary btn-lg">
                Browse products
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link to="/cart" className="btn btn-outline btn-lg text-white border-white/80 hover:border-white hover:bg-white/10">
                View cart
              </Link>
            </motion.div>
            <motion.div variants={stagger} className="mt-8 grid gap-4 sm:grid-cols-3">
              {["Secure checkout", "24/7 support", "Easy returns"].map((item) => (
                <motion.div key={item} variants={fadeUp} className="rounded-xl border border-white/25 bg-white/10 p-4 text-sm font-medium text-white/90">
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="space-y-4"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-3 text-center">
            <h1 className="w-full text-center text-3xl font-bold text-base-content drop-shadow sm:w-auto sm:text-left sm:text-4xl">Main Categories</h1>
            <Link to="/products" className="btn btn-ghost btn-sm text-base-content border border-base-content/40 hover:border-base-content/60">
              View all
            </Link>
          </motion.div>
          <div className="grid gap-4 lg:grid-cols-2">
            {[0, 1].map((col) => (
              <div key={col} className="space-y-4">
                {heroProducts.slice(col * 3, col * 3 + 3).map((item, idx) => (
                  <motion.article
                    key={item.title}
                    variants={fadeUp}
                    transition={{ delay: 0.05 * (col * 3 + idx), duration: 0.45, ease: "easeOut" }}
                    className="card overflow-hidden border border-white/30 bg-white/12 backdrop-blur-md shadow-lg transition duration-200 hover:scale-[1.06] hover:border-[#b85c00] hover:cursor-pointer"
                  >
                    <div className="relative bg-gradient-to-br from-white/15 via-white/10 to-white/5 text-white">
                      <div className="absolute inset-0 opacity-70">
                        <SparklesCore particleCount={70} className="h-full w-full" />
                      </div>
                      <div className="card-body relative z-10">
                        <div className="flex items-center gap-2 text-sm text-white/90">
                          <span className="badge badge-secondary text-white">{item.badge}</span>
                        </div>
                        <h3 className="card-title text-xl text-white">{item.title}</h3>
                        <p className="text-sm text-white/80">{item.blurb}</p>
                        <div className="card-actions justify-end">
                          <Link
                            to={`/categories/${item.slug}`}
                            className="btn btn-sm border-none bg-[#b85c00] text-orange-50 shadow-sm hover:brightness-105"
                          >
                            Visit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <motion.section
        className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
      >
        <motion.h1 variants={fadeUp} className="text-2xl font-bold text-center">
          Most Trending Products
        </motion.h1>
        <div className="relative mt-4 overflow-hidden rounded-xl border border-base-300 bg-base-200">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-base-200 via-base-200/70 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-base-200 via-base-200/70 to-transparent" />
          <div
            className="flex gap-6 py-6"
            style={{ animation: "marquee-right 28s linear infinite", width: "200%" }}
          >
            {[0, 1].map((loop) => (
              <div key={loop} className="flex min-w-full gap-6">
                {trendingImages.map((img) => (
                  <div
                    key={`${loop}-${img}`}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm sm:h-28 sm:w-28"
                  >
                    <img src={`/product-images/${img}`} alt={img.replace(/\.webp$/, "")} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

    </>
  );
}
