import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate, Link } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { BsApple } from "react-icons/bs";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      navigate("/");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider: 'google' | 'apple') {
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 opacity-90"></div>

        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-start px-16 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/images/CryptoPulseLogo.png"
                alt="CryptoPulse Logo"
                className="h-30 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 -ml-6">
                CryptoPulse
              </h1>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full"></div>
          </div>

          <p className="text-2xl font-light mb-6 text-purple-100">
            Track, Share, and Grow
          </p>

          <p className="text-lg text-purple-200 max-w-md leading-relaxed">
            Join the ultimate cryptocurrency community. Track prices, share insights, and connect with traders worldwide.
          </p>

          <div className="mt-12 space-y-4 text-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Real-time market data</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
              <span>Social trading insights</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              <span>Price alerts & notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Glassmorphism card */}
        <div className="w-full max-w-md">
          <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-800/50">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold !text-white mb-2">Welcome Back</h2>
              <p className="!text-white opacity-80">Enter your credentials to access your account</p>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                <p className="text-red-400 text-sm">{errorMsg}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email input */}
              <div>
                <label className="block text-sm font-medium !text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <AiOutlineMail className="text-white opacity-60 text-xl" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl !text-white placeholder-white placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password input */}
              <div>
                <label className="block text-sm font-medium !text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <AiOutlineLock className="text-white opacity-60 text-xl" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl !text-white placeholder-white placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white opacity-60 hover:opacity-100 transition-opacity"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible className="text-xl" />
                    ) : (
                      <AiOutlineEye className="text-xl" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-gray-900 cursor-pointer"
                  />
                  <span className="ml-2 text-sm !text-white opacity-80 group-hover:opacity-100 transition-colors">
                    Remember me
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 !text-white font-semibold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
              <span className="text-sm !text-white opacity-60">Or login with</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
            </div>

            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="flex items-center justify-center gap-3 py-3 px-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl !text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                <FcGoogle className="text-2xl" />
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                disabled={loading}
                className="flex items-center justify-center gap-3 py-3 px-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl !text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                <BsApple className="text-2xl" />
                <span>Apple</span>
              </button>
            </div>

            {/* Sign up link */}
            <p className="mt-8 text-center !text-white opacity-80">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>

          {/* Mobile branding */}
          <div className="mt-8 text-center lg:hidden">
            <p className="text-white opacity-60 text-sm">
              © 2025 Crypto Social. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
