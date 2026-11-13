"use client";

import { useState, useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Icon } from "@iconify/react";
import { Project } from "@/types";
import ProjectCard from "./ProjectCard";

interface AllProjectsClientProps {
  initialProjects: Project[];
}

type ViewMode = "wide" | "compact";

function useColumnCount(viewMode: ViewMode) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (viewMode === "compact") {
    return 1;
  }

  if (windowWidth < 768) {
    return 1;
  } else if (windowWidth < 1024) {
    return 2;
  } else {
    return 3;
  }
}

export default function AllProjectsClient({ initialProjects }: AllProjectsClientProps) {
  const [projects] = useState<Project[]>(() => {
    return initialProjects.map((p) => {
      const customTechs = (p.custom_tech_stacks || []).map((c) => ({
        id: `custom-${c.name}`,
        name: c.name,
        identifier: c.icon_url,
      }));
      return {
        ...p,
        skills: [...(p.skills || []), ...customTechs],
      };
    });
  });

  // Default mode adalah Wide (3 Kolom)
  const [viewMode, setViewMode] = useState<ViewMode>("wide");
  // isInitialEntrance hanya aktif saat pertama kali halaman dimuat
  const [isInitialEntrance, setIsInitialEntrance] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("projects_view_mode") as ViewMode | null;
    if (saved === "wide" || saved === "compact") {
      setViewMode(saved);
    }
    NProgress.done();

    // Selesaikan periode animasi awal (600ms keyframe + stagger cascade)
    const timer = setTimeout(() => {
      setIsInitialEntrance(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const cols = useColumnCount(viewMode);

  const toggleViewMode = () => {
    // Matikan animasi awal seketika jika pengguna mengklik toggle
    setIsInitialEntrance(false);
    const next: ViewMode = viewMode === "wide" ? "compact" : "wide";
    setViewMode(next);
    localStorage.setItem("projects_view_mode", next);
  };

  // Urutan proyek dari admin (kiri ke kanan, lalu baris bawahnya):
  // Cols = 3: Row 1 (1, 2, 3), Row 2 (4, 5, 6), Row 3 (7, 8, 9)
  // Cols = 2: Row 1 (1, 2), Row 2 (3, 4), Row 3 (5, 6)
  // Cols = 1: Row 1 (1), Row 2 (2), Row 3 (3)
  const columns = Array.from({ length: cols }, (_, colIndex) =>
    projects.filter((_, itemIndex) => itemIndex % cols === colIndex)
  );

  return (
    <section className="min-h-screen font-sans text-black dark:text-white -mt-8 md:-mt-2 pt-16 md:pt-24 pb-20 px-6">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a3a3a3; }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #404040; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #525252; }

        .markdown-preview ul {
          list-style-type: disc !important;
          list-style-position: outside !important;
          margin-left: 0 !important;
          padding-left: 1.15rem !important;
          margin-bottom: 0.5rem !important;
        }
        .markdown-preview ol {
          list-style-type: decimal !important;
          list-style-position: outside !important;
          margin-left: 0 !important;
          padding-left: 1.25rem !important;
          margin-bottom: 0.5rem !important;
        }
        .markdown-preview li { display: list-item !important; margin-bottom: 0.25rem; }
        .markdown-preview p { margin-bottom: 0.75rem; }
        .markdown-preview strong, .markdown-preview b { font-weight: 600 !important; color: inherit; }
        .markdown-preview em, .markdown-preview i { font-style: italic !important; }
      `}</style>

      {/* Header TERKUNCI PERMANEN di max-w-[560px] persis sama dengan /blogs dan / */}
      <div className="w-full max-w-[560px] flex flex-col mx-auto mt-4 md:mt-10 mb-8 md:mb-12">
        <header className="flex items-center justify-between">
          <h1
            data-animate
            style={{ "--stagger": 0 } as React.CSSProperties}
            className="text-[24px] font-normal leading-snug tracking-tight text-black dark:text-white"
          >
            Projects
          </h1>

          {/* Single Toggle Icon - Aktif di Tablet + Desktop (md:flex), nonaktif di Mobile (hidden) */}
          <button
            onClick={toggleViewMode}
            data-animate
            style={{ "--stagger": 0 } as React.CSSProperties}
            title={viewMode === "wide" ? "Change to single column view" : "Change to wide view"}
            aria-label={viewMode === "wide" ? "Change to single column view" : "Change to wide view"}
            className="hidden md:flex p-1.5 rounded-md text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
          >
            <Icon
              icon={viewMode === "wide" ? "lucide:rows-2" : "lucide:columns-3"}
              className="w-5 h-5"
            />
          </button>
        </header>
      </div>

      {/* Area Kartu Proyek:
          - Saat Wide: Melebar ke max-w-7xl
          - Saat Compact: Menggunakan max-w-[560px] w-full mx-auto (sejajar persis dengan header)
          - Tanpa transition-all agar perpindahan mode instan dan bersih sesuai permintaan */}
      <div
        className={`w-full mx-auto ${viewMode === "wide" ? "max-w-7xl md:px-2" : "max-w-[560px]"
          }`}
      >
        {projects.length > 0 ? (
          <div
            className={`grid gap-6 items-start ${cols === 1
              ? "grid-cols-1"
              : cols === 2
                ? "grid-cols-2"
                : "grid-cols-3"
              }`}
          >
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-6">
                {col.map((project) => {
                  const originalIndex = projects.findIndex((p) => p.id === project.id);
                  return (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      dataAnimate={isInitialEntrance}
                      staggerIndex={originalIndex + 1}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-neutral-400 dark:text-neutral-500 py-20 font-sans text-xs">
            No projects found.
          </div>
        )}
      </div>
    </section>
  );
}
