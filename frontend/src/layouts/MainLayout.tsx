import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
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

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#7a3a00] bg-[#b85c00] backdrop-blur shadow-lg shadow-[#7a3a00]/40 text-orange-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBagIcon className="h-6 w-6 text-orange-200" />
            <Link to="/" className="text-orange-100">My E-Com</Link>
          </div>
          <nav className="hidden items-center gap-2 text-sm font-medium sm:flex">
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
          <div className="flex items-center gap-2 text-sm font-medium">
            {user ? (
              <>
                <span className="hidden text-sm text-orange-100 sm:inline">{user.email}</span>
                <button className="btn btn-ghost btn-sm text-orange-50" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm text-orange-50">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign up
                </Link>
              </>
            )}
            <Link to="/cart" className="btn btn-ghost btn-sm text-orange-50 sm:hidden">
              Cart{cartCount ? ` (${cartCount})` : ""}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 pt-24 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-base-300/60 bg-base-100/80 text-sm text-base-content/80">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
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
              <Link to="/about" className="link-hover block">About My E-Com</Link>
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
                <img src="/product-images/x%20logo.png" alt="X" className="h-7 w-7 object-contain transition-transform duration-150 hover:scale-110 cursor-pointer" />
                <img src="/product-images/youtube%20logo.png" alt="YouTube" className="h-7 w-7 object-contain transition-transform duration-150 hover:scale-110 cursor-pointer" />
                <img src="/product-images/linkedin%20logo.png" alt="LinkedIn" className="h-7 w-7 object-contain transition-transform duration-150 hover:scale-110 cursor-pointer" />
                <img src="/product-images/tiktok%20logo.png" alt="TikTok" className="h-7 w-7 object-contain transition-transform duration-150 hover:scale-110 cursor-pointer" />
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
