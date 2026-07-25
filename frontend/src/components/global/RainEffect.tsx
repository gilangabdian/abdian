"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function RainEffect() {
  const pathname = usePathname();
  const [drops, setDrops] = useState<any[]>([]);

  useEffect(() => {
    // Generate random raindrops on client-side to avoid hydration mismatch
    const generateDrops = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 1.5 + 0.5}s`, // 0.5s to 2.0s
      animationDelay: `${Math.random() * 2}s`,
      opacity: Math.random() * 0.4 + 0.1, // 0.1 to 0.5
      width: `${Math.random() * 1.5 + 0.5}px`, // 0.5px to 2px
      height: `${Math.random() * 15 + 10}px`, // 10px to 25px
    }));
    setDrops(generateDrops);
  }, []);

  // Sembunyikan efek jika di halaman single blog
  if (pathname.startsWith('/blogs/') && pathname !== '/blogs') {
    return null;
  }

  if (drops.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <style>{`
        @keyframes rainFall {
          0% {
            transform: translateY(-100px);
          }
          100% {
            transform: translateY(110vh);
          }
        }
        .rain-drop {
          position: absolute;
          top: -50px;
          animation: rainFall linear infinite;
          border-radius: 999px;
        }
      `}</style>
      
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="rain-drop bg-black dark:bg-white"
          style={{
            left: drop.left,
            width: drop.width,
            height: drop.height,
            opacity: drop.opacity,
            animationDuration: drop.animationDuration,
            animationDelay: drop.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
