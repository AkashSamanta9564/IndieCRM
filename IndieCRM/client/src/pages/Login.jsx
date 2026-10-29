import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(`Welcome back, ${data.user.name}!`);

      navigate("/");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex text-white">
      {/* Left Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2563eb22,transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#4f46e511,transparent_40%)]" />

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
              I
            </div>
            <h1 className="text-3xl font-bold">IndieCRM</h1>
          </div>

          <h2 className="text-5xl font-bold leading-tight mb-6">
            Close more deals with AI.
          </h2>

          <p className="text-gray-400 text-lg leading-8">
            A premium CRM built for freelancers, startups and agencies.
            Manage leads, automate follow-ups and score prospects with AI.
          </p>

          <div className="flex gap-6 mt-14 text-sm text-gray-500">
            <span>✓ Secure</span>
            <span>✓ AI Powered</span>
            <span>✓ Cloud Sync</span>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-white/8 bg-[#0B1220] p-8 shadow-[0_0_40px_rgba(37,99,235,0.08)]">

          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-gray-400 mb-8">
            Sign in to continue to IndieCRM.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm text-gray-400">Email</label>

              <div className="mt-2 flex items-center rounded-xl border border-white/8 bg-white/5 px-4">
                <Mail size={18} className="text-gray-500" />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full bg-transparent px-3 py-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">Password</label>

              <div className="mt-2 flex items-center rounded-xl border border-white/8 bg-white/5 px-4">
                <Lock size={18} className="text-gray-500" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full bg-transparent px-3 py-3 outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-500" />
                  ) : (
                    <Eye size={18} className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <label className="flex gap-2 items-center text-gray-400">
                <input type="checkbox" />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold transition hover:scale-[1.01] disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-gray-500 text-sm">OR</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          <button className="w-full rounded-xl border border-white/8 bg-white/5 py-3 transition hover:bg-white/8">
            Continue with Google
          </button>

          <p className="mt-8 text-center text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:text-blue-300">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;