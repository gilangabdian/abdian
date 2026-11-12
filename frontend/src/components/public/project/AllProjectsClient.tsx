"use client";

import { useState, useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import gsap from "gsap";
import { Project } from "@/types";
import ProjectCard from "./ProjectCard";

interface AllProjectsClientProps {
  initialProjects: Project[];
}

function useColumnCount() {
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) {
        setCols(1);
      } else if (window.innerWidth < 1024) {
        setCols(2);
      } else {
        setCols(3);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cols;
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

  const cols = useColumnCount();

  useEffect(() => {
    NProgress.done();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      const timer = setTimeout(() => {
        gsap.fromTo(
          ".project-page-title",
          { y: 30, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out" }
        );
        gsap.fromTo(
          ".project-card-item",
          { y: 20, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.05,
            clearProps: "all",
          }
        );
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [projects.length, cols]);

  // Distribute projects across columns so the reading order is horizontal (row-by-row):
  // Row 1: Item 1, Item 2, Item 3
  // Row 2: Item 4, Item 5, Item 6
  // Row 3: Item 7, Item 8, Item 9
  const columns = Array.from({ length: cols }, (_, colIndex) =>
    projects.filter((_, itemIndex) => itemIndex % cols === colIndex)
  );

  return (
    <div className="min-h-screen">
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
        .markdown-preview strong, .markdown-preview b { font-weight: 900 !important; color: inherit; }
        .markdown-preview em, .markdown-preview i { font-style: italic !important; }
      `}</style>

      <div className="px-6 mt-16 md:mt-0 py-16 md:px-8 max-w-7xl mx-auto">
        <div
          className="text-center mb-16 md:mb-20 -mt-12 md:mt-7 project-page-title"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide text-black dark:text-white">Projects</h1>
          <p className="mt-4 font-sans text-neutral-600 dark:text-neutral-400 text-sm md:text-base max-w-xl mx-auto italic">
            "Projects that i created."
          </p>
        </div>

        {projects.length > 0 ? (
          <div
            className={`grid gap-6 items-start max-w-7xl mx-auto ${cols === 1 ? "grid-cols-1" : cols === 2 ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}
          >
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-6">
                {col.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-neutral-500 py-20 font-sans">No projects found.</div>
        )}
      </div>
    </div>
  );
}
