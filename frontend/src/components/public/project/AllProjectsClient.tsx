"use client";

import { useState, useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Project } from "@/types";
import ProjectCard from "./ProjectCard";

interface AllProjectsClientProps {
  initialProjects: Project[];
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

  useEffect(() => {
    NProgress.done();
  }, []);

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

        @keyframes projectFadeInUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .project-page-title {
          animation: projectFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .project-card-item {
          animation: projectFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .project-card-item:nth-child(1) { animation-delay: 0.04s; }
        .project-card-item:nth-child(2) { animation-delay: 0.08s; }
        .project-card-item:nth-child(3) { animation-delay: 0.12s; }
        .project-card-item:nth-child(4) { animation-delay: 0.16s; }
        .project-card-item:nth-child(5) { animation-delay: 0.20s; }
        .project-card-item:nth-child(6) { animation-delay: 0.24s; }
        .project-card-item:nth-child(n+7) { animation-delay: 0.28s; }
      `}</style>

      <div className="px-6 mt-16 md:mt-0 py-16 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20 -mt-12 md:mt-7 project-page-title">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide text-black dark:text-white">All Projects</h1>
          <p className="mt-4 font-sans text-neutral-600 dark:text-neutral-400 text-sm md:text-base max-w-xl mx-auto italic">
            "Projects that i created."
          </p>
        </div>

        {projects.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:_balance] max-w-7xl mx-auto">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center text-neutral-500 py-20 font-sans">No projects found.</div>
        )}
      </div>
    </div>
  );
}
