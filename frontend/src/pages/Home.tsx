import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeroHighlight, Highlight } from "../components/ui/hero-highlight";
import { SparklesCore } from "../components/ui/sparkles";
import { formatCurrency } from "../lib/currency";

const heroProducts = [
  {
    title: "Noise-Canceling Headphones",
    price: 249000,
    badge: "Bestseller",
    blurb: "Immersive sound with 35h battery and adaptive EQ.",
  },
  {
    title: "4K OLED TV",
    price: 1299000,
    badge: "New",
    blurb: "Ultra-thin design with vivid HDR and 120Hz refresh.",
  },
  {
    title: "Smartwatch",
    price: 299000,
    badge: "Trending",
    blurb: "Health tracking, GPS, and 7-day battery life.",
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
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] bg-[#b85c00] text-orange-50 rounded-3xl p-4 sm:p-6 border border-[#7a3a00] shadow-lg shadow-[#7a3a00]/40">
        <HeroHighlight containerClassName="h-full min-h-[26rem] rounded-2xl border border-base-300 bg-base-100/80 shadow-lg" className="w-full">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="w-full max-w-3xl px-6 py-10 sm:px-10 sm:py-12"
          >
            <motion.p variants={fadeUp} className="badge badge-primary badge-lg mb-4">
              Electronics
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-3xl font-extrabold leading-tight sm:text-4xl">
              Shop the latest electronics with <Highlight className="text-black dark:text-white">fast</Highlight> delivery & flexible payments.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-4 text-base text-base-content/80 sm:text-lg">
              Curated gadgets, transparent pricing, and a checkout experience inspired by Amazon and Shopify—built for learning.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" className="btn btn-primary btn-lg">
                Browse products
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link to="/cart" className="btn btn-ghost btn-lg">
                View cart
              </Link>
            </motion.div>
            <motion.div variants={stagger} className="mt-8 grid gap-4 sm:grid-cols-3">
              {["Secure checkout", "24/7 support", "Easy returns"].map((item) => (
                <motion.div key={item} variants={fadeUp} className="rounded-xl border border-base-300 bg-base-200/60 p-4 text-sm font-medium">
                  {item}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </HeroHighlight>

        <motion.div
          className="space-y-4"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Featured picks</h2>
            <Link to="/products" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {heroProducts.map((item, idx) => (
              <motion.article
                key={item.title}
                variants={fadeUp}
                transition={{ delay: 0.05 * idx, duration: 0.45, ease: "easeOut" }}
                className="card border border-base-300 bg-base-100 shadow-sm overflow-hidden transition duration-200 hover:scale-[1.02] cursor-pointer"
              >
                <div className="relative bg-black text-white">
                  <div className="absolute inset-0">
                    <SparklesCore particleCount={90} className="h-full w-full" />
                    <div className="absolute inset-x-16 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
                    <div className="absolute inset-x-16 top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                    <div className="absolute inset-x-40 top-0 h-[4px] w-1/3 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-sm" />
                    <div className="absolute inset-x-40 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
                    <div className="absolute inset-0 bg-black [mask-image:radial-gradient(280px_160px_at_top,transparent_20%,white)]" />
                  </div>
                  <div className="card-body relative z-10 text-base-content">
                    <div className="flex items-center gap-2 text-white">
                      <span className="badge badge-secondary">{item.badge}</span>
                      <span className="text-xs text-white/80">{formatCurrency(item.price)}</span>
                    </div>
                    <h3 className="card-title text-xl text-white">{item.title}</h3>
                    <p className="text-sm text-white/80">{item.blurb}</p>
                    <div className="card-actions justify-end">
                      <button className="btn btn-sm bg-[#b85c00] text-orange-50 border-[#7a3a00] hover:bg-[#a14f00] hover:border-[#7a3a00]">
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
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
        <div className="relative mt-4 overflow-hidden rounded-xl border border-[#7a3a00] bg-[#b85c00]">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#b85c00] via-[#b85c00]/70 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#b85c00] via-[#b85c00]/70 to-transparent" />
          <div
            className="flex gap-6 py-6"
            style={{ animation: "marquee-right 28s linear infinite", width: "200%" }}
          >
            {[0, 1].map((loop) => (
              <div key={loop} className="flex min-w-full gap-6">
                {trendingImages.map((img) => (
                  <div
                    key={`${loop}-${img}`}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-base-300 bg-base-100/80 shadow-sm sm:h-28 sm:w-28"
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
