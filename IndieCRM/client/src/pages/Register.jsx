import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Replaced http://localhost:5000 with the environment variable as per image_83bcd3.png
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast.success("Account created successfully!");

      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Registration failed");
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
            Build your sales workspace.
          </h2>

          <p className="text-gray-400 text-lg leading-8">
            Create your IndieCRM account and start managing leads,
            automating follow-ups and closing more deals with AI.
          </p>

          <div className="flex gap-6 mt-14 text-sm text-gray-500">
            <span>✓ Free Trial</span>
            <span>✓ AI Powered</span>
            <span>✓ Secure</span>
          </div>
        </div>
      </div>

      {/* Register Card */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-white/8 bg-[#0B1220] p-8 shadow-[0_0_40px_rgba(37,99,235,0.08)]">
          <h2 className="text-3xl font-bold mb-2">
            Create your account
          </h2>

          <p className="text-gray-400 mb-8">
            Start your IndieCRM journey today.
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name */}
            <div>
              <label className="text-sm text-gray-400">
                Full Name
              </label>

              <div className="mt-2 flex items-center rounded-xl border border-white/8 bg-white/5 px-4">
                <User size={18} className="text-gray-500" />

                <input
                  type="text"
                  placeholder="Akash Samanta"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className="w-full bg-transparent px-3 py-3 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-400">
                Email
              </label>

              <div className="mt-2 flex items-center rounded-xl border border-white/8 bg-white/5 px-4">
                <Mail size={18} className="text-gray-500" />

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  className="w-full bg-transparent px-3 py-3 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-400">
                Password
              </label>

              <div className="mt-2 flex items-center rounded-xl border border-white/8 bg-white/5 px-4">
                <Lock size={18} className="text-gray-500" />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  className="w-full bg-transparent px-3 py-3 outline-none"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={18}
                      className="text-gray-500"
                    />
                  ) : (
                    <Eye
                      size={18}
                      className="text-gray-500"
                    />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Use at least 8 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold transition hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
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
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;