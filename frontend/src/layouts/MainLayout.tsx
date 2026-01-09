import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bars3Icon, MoonIcon, SunIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { Toasts } from "../components/Toasts";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/cart", label: "Cart" },
  { to: "/orders", label: "Orders" },
  { to: "/admin", label: "Admin" },
];

export function MainLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const cartCount = useCartStore((s) => s.items.reduce((acc, item) => acc + item.quantity, 0));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const stored = localStorage.getItem("theme");
    return stored === "light" || stored === "dark" ? stored : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    document.body.classList.toggle("theme-dark", theme === "dark");
    document.body.classList.toggle("theme-light", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <a
        href="https://wa.me/256761856198"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-[60] btn btn-md px-4 border-none bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 hover:brightness-105"
        aria-label="WhatsApp Me"
      >
        WhatsApp Me
      </a>

      <header className="fixed inset-x-0 top-0 z-50 h-16 overflow-visible border-b border-[#7a3a00] bg-[#b85c00] backdrop-blur shadow-lg shadow-[#7a3a00]/40 text-orange-50">
        <div className="mx-auto flex h-full max-w-6xl items-center gap-3 px-4 sm:px-6 overflow-visible">
          <Link to="/" className="flex items-center text-lg font-bold text-orange-100">
            <img
              src="/payment%20methods/logo3.png"
              alt="Brand logo"
              className="h-56 w-56 rounded-md object-contain"
            />
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-2 text-sm font-medium sm:flex">
            {navLinks.map((link) => {
              const active = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`btn btn-ghost btn-sm text-orange-50 ${active ? "btn-active" : ""}`}
                >
                  <span className="flex items-center gap-2">
                    {link.label}
                    {link.to === "/cart" && cartCount > 0 && (
                      <span className="badge badge-primary badge-sm">{cartCount}</span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-sm font-medium bg-[#b85c00] px-2 py-1 rounded-lg">
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm text-orange-50 hidden sm:inline-flex"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            {user ? (
              <>
                <span className="hidden text-sm text-orange-100 sm:inline">{user.email}</span>
                <button className="btn btn-ghost btn-sm text-orange-50 hidden sm:inline-flex" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm text-orange-50 hidden sm:inline-flex">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm hidden sm:inline-flex">
                  Sign up
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsMenuOpen((v) => !v)}
              className="btn btn-ghost btn-sm text-orange-50 border border-orange-200/50 sm:hidden"
              aria-label="Toggle navigation"
            >
              {isMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="fixed inset-0 z-[70] sm:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsMenuOpen(false)} aria-hidden />
            <div className="absolute inset-y-0 right-0 w-72 max-w-[80vw] bg-[#b85c00] text-orange-50 shadow-2xl border-l border-[#7a3a00] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-bold">
                  <img
                    src="/payment%20methods/logo3.png"
                    alt="Brand logo"
                    className="h-40 w-40 rounded-md object-contain"
                  />
                  <span>KennyCom</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn btn-ghost btn-xs text-orange-50"
                  aria-label="Close navigation"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const active = pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMenuOpen(false)}
                      className={`btn btn-sm w-full justify-start rounded-xl border border-[#f1b46c]/70 bg-[#d87416] font-semibold text-white shadow-sm transition hover:bg-[#f28a1f] hover:border-[#f7c78a] ${active ? "bg-[#f28a1f] border-[#f7c78a]" : ""}`}
                    >
                      <span className="flex items-center gap-2">
                        {link.label}
                        {link.to === "/cart" && cartCount > 0 && (
                          <span className="badge badge-secondary badge-sm text-white">{cartCount}</span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                    setIsMenuOpen(false);
                  }}
                  className="btn btn-sm rounded-xl border border-[#f1b46c]/70 bg-[#d87416] text-white shadow-sm hover:bg-[#f28a1f] hover:border-[#f7c78a]"
                >
                  Theme
                </button>
                {user ? (
                  <button
                    className="btn btn-sm rounded-xl border border-[#f1b46c]/70 bg-[#d87416] text-white shadow-sm hover:bg-[#f28a1f] hover:border-[#f7c78a]"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="btn btn-sm rounded-xl border border-[#f1b46c]/70 bg-[#d87416] text-white shadow-sm hover:bg-[#f28a1f] hover:border-[#f7c78a]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-primary btn-sm rounded-xl shadow-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 pt-24 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-base-300/60 bg-base-100/80 text-sm text-base-content/80">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex items-center gap-3">
            <img
              src="/payment%20methods/logo3.png"
              alt="Brand logo"
              className="h-56 w-56 rounded-md object-contain"
            />
            <div>
              <div className="text-lg font-bold text-base-content">KennyCom</div>
              <div className="text-xs text-base-content/70">Smart shopping made easy.</div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="font-semibold text-base-content">Need help?</div>
              <Link to="/contact" className="link-hover block">Chat with us</Link>
              <Link to="/support" className="link-hover block">Help Center</Link>
              <Link to="/contact" className="link-hover block">Contact us</Link>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-base-content">Useful links</div>
              <Link to="/orders" className="link-hover block">Track an order</Link>
              <Link to="/products" className="link-hover block">Shop all products</Link>
              <Link to="/policies/shipping" className="link-hover block">Shipping & Delivery</Link>
              <Link to="/policies/returns" className="link-hover block">Returns & Refunds</Link>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-base-content">About</div>
              <Link to="/about" className="link-hover block">About Kenny.Com</Link>
              <Link to="/careers" className="link-hover block">Careers</Link>
              <Link to="/policies/privacy" className="link-hover block">Privacy Policy</Link>
              <Link to="/policies/terms" className="link-hover block">Terms & Conditions</Link>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-base-content">Make money with us</div>
              <Link to="/sell" className="link-hover block">Sell on My E-Com</Link>
              <Link to="/partners" className="link-hover block">Partner program</Link>
              <Link to="/pickup" className="link-hover block">Pickup points</Link>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <div className="font-semibold text-base-content">International</div>
              <div className="flex flex-wrap gap-2 text-xs text-base-content/70">
                {[
                  "Kenya",
                  "Nigeria",
                  "Ghana",
                  "Morocco",
                  "Senegal",
                  "Algeria",
                  "Egypt",
                ].map((c) => (
                  <span key={c} className="badge badge-outline badge-xs">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="font-semibold text-base-content">Follow us</div>
              <div className="flex flex-wrap items-center gap-3 text-base-content/70">
                <img src="/product-images/facebook%20logo.png" alt="Facebook" className="h-7 w-7 object-contain transition-transform duration-150 hover:scale-110 cursor-pointer" />
                <img src="/product-images/instagram%20logo.png" alt="Instagram" className="h-7 w-7 object-contain transition-transform duration-150 hover:scale-110 cursor-pointer" />
                <a
                  href="https://x.com/home"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex"
                  aria-label="X profile"
                >
                  <img src="/product-images/x%20logo.png" alt="X" className="h-7 w-7 object-contain transition-transform duration-150 hover:scale-110" />
                </a>
                <a
                  href="https://www.youtube.com/@AshK-visuals"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex"
                  aria-label="YouTube channel"
                >
                  <img src="/product-images/youtube%20logo.png" alt="YouTube" className="h-7 w-7 object-contain transition-transform duration-150 hover:scale-110" />
                </a>
                <a
                  href="https://www.linkedin.com/in/ashiraf-kenny-90ab99391/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex"
                  aria-label="LinkedIn profile"
                >
                  <img src="/product-images/linkedin%20logo.png" alt="LinkedIn" className="h-7 w-7 object-contain transition-transform duration-150 hover:scale-110" />
                </a>
                <a
                  href="https://www.tiktok.com/en/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex"
                  aria-label="TikTok profile"
                >
                  <img src="/product-images/tiktok%20logo.png" alt="TikTok" className="h-7 w-7 object-contain transition-transform duration-150 hover:scale-110" />
                </a>
              </div>
            </div>
            <div className="space-y-3">
              <div className="font-semibold text-base-content">Payment methods</div>
              <div className="flex flex-wrap items-center gap-3 text-base-content/70">
                <img src="/payment methods/airtel.png" alt="Payment logo" className="h-7 w-auto object-contain" />
                <img src="/payment methods/image-removebg-preview%20(5).png" alt="Payment logo" className="h-7 w-auto object-contain" />
                <img src="/payment methods/image-removebg-preview%20(6).png" alt="Payment logo" className="h-7 w-auto object-contain" />
                <img src="/payment methods/image-removebg-preview%20(7).png" alt="Payment logo" className="h-7 w-auto object-contain" />
                <img src="/payment methods/image-removebg-preview%20(8).png" alt="Payment logo" className="h-7 w-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </footer>

      <Toasts />
    </div>
  );
}
