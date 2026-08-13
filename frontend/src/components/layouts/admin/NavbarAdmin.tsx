"use client";


import { useRouter } from "next/navigation";
import { removeToken } from "@/utils/auth"; // Assuming an auth util

export default function NavbarAdmin({ onToggleMenu }: { onToggleMenu: () => void }) {
  const router = useRouter();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    // Assuming simple token removal and redirect to login
    removeToken();
    router.push("/admin/login");
  };

  return (
    <header className="h-16 bg-white border-b-4 border-black flex items-center justify-between px-4 md:px-6 shadow-sm z-30 sticky top-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMenu}
          className="md:hidden p-2 border-2 border-black bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center text-black">
          <iconify-icon icon="lucide:menu" width="24" height="24" />
        </button>

        <h2 className="text-lg md:text-2xl font-black italic tracking-widest text-black drop-shadow-md truncate">
          DASHBOARD
        </h2>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="hidden md:flex flex-col items-end mr-2 text-black">
          <span className="font-bold text-sm">Super Admin</span>
          <span className="text-xs font-mono bg-black text-white px-1">ONLINE</span>
        </div>

        <div className="h-10 w-10 md:h-12 md:w-12 bg-gray-200 rounded-full border-2 border-black overflow-hidden shrink-0">
          { }
          <img loading="lazy" src="/abdian.png" alt="Admin" className="object-cover object-top w-full h-full" />
        </div>

        <button
          onClick={handleLogout}
          className="bg-black hover:bg-gray-800 text-white font-bold py-1 px-3 md:px-4 text-xs md:text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap">
          LOGOUT
        </button>
      </div>
    </header>
  );
}
