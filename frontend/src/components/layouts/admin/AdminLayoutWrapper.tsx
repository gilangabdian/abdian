"use client";

import { useState, useEffect } from "react";
import SidebarAdmin from "./SidebarAdmin";
import NavbarAdmin from "./NavbarAdmin";
import FooterAdmin from "./FooterAdmin";
import { useRouter, usePathname } from "next/navigation";
import { getToken } from "@/utils/auth";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getToken();
    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else {
      setIsAuthChecking(false);
    }
  }, [router, pathname]);

  useEffect(() => {
    // Handle NProgress for routing inside admin
    NProgress.done();
  }, [pathname]);

  if (isAuthChecking) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-black">Checking Auth...</div>;
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-gray-50 text-black font-sans relative">
      {isMobileSidebarOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <SidebarAdmin
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <NavbarAdmin onToggleMenu={toggleMobileSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>

        <FooterAdmin />
      </div>
    </div>
  );
}
