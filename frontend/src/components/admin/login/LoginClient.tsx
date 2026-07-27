"use client";

import { useState } from "react";
import { setToken } from "@/utils/auth";
import { adminLogin } from "@/lib/api/admin";
import { Icon } from "@iconify/react";
import { alertError } from "@/lib/alert";

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      // adminLogin in api/admin.ts throws an error if !res.ok
      const responseBody = await adminLogin({ email, password });

      if (responseBody.token) {
          setToken(responseBody.token);
          // Use window.location.href for full page navigation after auth
          // This avoids race conditions with Next.js client-side router during login transition
          window.location.href = "/admin/dashboard";
        }
    } catch (error: any) {
      console.error("Login error:", error);
      await alertError(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-6 font-sans selection:bg-white selection:text-black">
      <div className="w-full max-w-sm">
        {/* Header Minimalis */}
        <div className="text-center mb-10">
          <h1 className="text-white text-2xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mt-2">Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Email Address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full bg-[#1e1e1e] border border-white/5 rounded-xl py-3.5 px-4 text-white text-sm outline-none focus:border-white/20 focus:bg-[#252525] transition-all placeholder:text-gray-600"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Password</label>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-[#1e1e1e] border border-white/5 rounded-xl py-3.5 pl-4 pr-12 text-white text-sm outline-none focus:border-white/20 focus:bg-[#252525] transition-all placeholder:text-gray-600"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-white transition-colors"
              >
                <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ffffff] text-[#000000] font-bold py-3.5 rounded-xl text-sm transition-all hover:bg-[#e5e7eb] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6">
            {isLoading && <Icon icon="line-md:loading-twotone-loop" className="w-5 h-5" />}
            <span>{isLoading ? "Authenticating..." : "Sign In"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
