import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";

type LoginResponse = {
  user: {
    id: string;
    email: string;
    name?: string;
    role: "user" | "admin";
  };
  accessToken: string;
};

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.post<LoginResponse>("/api/auth/login", { email, password });
      setAuth({ user: data.user, accessToken: data.accessToken });
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to login";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-8 shadow-sm">
      <h1 className="text-2xl font-bold">Login</h1>
      <p className="text-base-content/80">Access your account to continue shopping.</p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="form-control w-full">
          <span className="label-text">Email</span>
          <input
            type="email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="form-control w-full">
          <span className="label-text">Password</span>
          <input
            type="password"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>

        {error && <p className="text-sm text-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
