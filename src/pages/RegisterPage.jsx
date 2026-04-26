import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, AlertCircle, UserPlus } from "lucide-react";
import ColorBends from "../components/ui/ColorBends";

const RegisterPage = () => {
  const { signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email": "Please enter a valid email.",
        "auth/weak-password": "Password is too weak.",
      };
      setError(msgs[err.code] || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <ColorBends
          colors={["#ffffff", "#555555", "#111111"]}
          rotation={90}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          noise={0.15}
          parallax={0.5}
          iterations={1}
          intensity={1.5}
          bandWidth={6}
          transparent
        />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-4 overflow-hidden p-1">
            <img src="/src/assets/logo.png" alt="Study Hub Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Study Hub</h1>
          <p className="text-slate-500 text-sm mt-1">Create your student workspace</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={15} className="text-red-400 shrink-0" />
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm
                  rounded-full pl-9 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-white transition"
              />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                name="password"
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm
                  rounded-full pl-9 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-white transition"
              />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                name="confirm"
                placeholder="Confirm password"
                value={form.confirm}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/60 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm
                  rounded-full pl-9 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-white transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white
                hover:bg-slate-200 text-black text-sm font-semibold rounded-full transition-all
                shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={15} /> Create Account
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover:text-slate-300 font-medium transition-colors underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
