"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setToken, getToken } from "@/utils/auth";
import { adminLogin } from "@/lib/api/admin";

export default function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (getToken()) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrorMsg("");
    try {
      // adminLogin in api/admin.ts throws an error if !res.ok
      const responseBody = await adminLogin({ email, password });
      
      if (responseBody.token) {
        setToken(responseBody.token);
        router.push("/admin/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMsg("Invalid email or password");
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

        {/* Error message */}
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl text-center">
            {errorMsg}
          </div>
        )}

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
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full bg-[#1e1e1e] border border-white/5 rounded-xl py-3.5 px-4 text-white text-sm outline-none focus:border-white/20 focus:bg-[#252525] transition-all placeholder:text-gray-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-bold py-3.5 rounded-xl text-sm transition-all hover:bg-gray-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {isLoading && (
              <iconify-icon icon="line-md:loading-twotone-loop" className="w-5 h-5" />
            )}
            <span>{isLoading ? "Authenticating..." : "Sign In"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
