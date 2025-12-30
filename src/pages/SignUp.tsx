import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate, Link } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineMail, AiOutlineLock, AiOutlineUser } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { BsApple } from "react-icons/bs";

export default function SignUp() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!acceptTerms) {
      setErrorMsg("Please accept the Terms & Conditions");
      return;
    }

    if (!username.trim()) {
      setErrorMsg("Username is required");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // Create profile
      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          username: username,
          email: email,
        });
      }

      navigate("/");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
      setLoading(false);
    }
  }

  async function handleSocialSignUp(provider: 'google' | 'apple') {
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
                className="h-16 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                CryptoPulse
              </h1>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full"></div>
          </div>

          <p className="text-2xl font-light mb-6 text-purple-100">
            Start Your Trading Journey
          </p>

          <p className="text-lg text-purple-200 max-w-md leading-relaxed">
            Create your account and join thousands of traders sharing insights, tracking portfolios, and making informed decisions.
          </p>

          <div className="mt-12 space-y-4 text-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Free forever, no credit card required</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
              <span>Advanced portfolio tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              <span>Connect with expert traders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - SignUp Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Glassmorphism card */}
        <div className="w-full max-w-md">
          <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-800/50 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold !text-white mb-2">Create Account</h2>
              <p className="!text-white opacity-80">Join Crypto Social and start trading smarter</p>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                <p className="text-red-400 text-sm">{errorMsg}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username input */}
              <div>
                <label className="block text-sm font-medium !text-white mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <AiOutlineUser className="text-white opacity-60 text-xl" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl !text-white placeholder-white placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="johndoe"
                  />
                </div>
              </div>

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
                    minLength={6}
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
                <p className="mt-1 text-xs !text-white opacity-60">Must be at least 6 characters</p>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5 mt-1">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-gray-900 cursor-pointer"
                  />
                </div>
                <label htmlFor="terms" className="ml-3 text-sm !text-white opacity-80 cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
                    Terms & Conditions
                  </Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Create Account button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 !text-white font-semibold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
              <span className="text-sm !text-white opacity-60">Or sign up with</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
            </div>

            {/* Social signup buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialSignUp('google')}
                disabled={loading}
                className="flex items-center justify-center gap-3 py-3 px-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl !text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                <FcGoogle className="text-2xl" />
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialSignUp('apple')}
                disabled={loading}
                className="flex items-center justify-center gap-3 py-3 px-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl !text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                <BsApple className="text-2xl" />
                <span>Apple</span>
              </button>
            </div>

            {/* Login link */}
            <p className="mt-6 text-center !text-white opacity-80">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Sign in
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
