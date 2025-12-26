import { Link, Outlet, useLocation } from "react-router-dom";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/cart", label: "Cart" },
  { to: "/orders", label: "Orders" },
  { to: "/admin", label: "Admin" },
];

export function MainLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <header className="border-b border-base-300 bg-base-100/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBagIcon className="h-6 w-6" />
            <Link to="/">My E-Com</Link>
          </div>
          <nav className="hidden items-center gap-2 text-sm font-medium sm:flex">
            {navLinks.map((link) => {
              const active = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`btn btn-ghost btn-sm ${active ? "btn-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
