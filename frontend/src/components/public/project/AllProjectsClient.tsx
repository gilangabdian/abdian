"use client";

import { useState, useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import gsap from "gsap";
import { Project } from "@/types";
import ProjectSidebar from "./ProjectSidebar";
import ProjectContent from "./ProjectContent";

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

  const [activeProject, setActiveProject] = useState<Project | null>(projects.length > 0 ? projects[0] : null);

  useEffect(() => {
    NProgress.done();
  }, []);

  useEffect(() => {
    const tl = gsap.timeline();

    // 1. Animasi Header
    tl.fromTo(
      ".page-title",
      { y: 30, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out",
      }
    );

    // 2. Animasi Content Desktop
    tl.fromTo(
      ".desktop-view",
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.4"
    );

    // 3. Animasi Content Mobile
    tl.fromTo(
      ".mobile-view",
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.6"
    );
  }, []);

  return (
    <div className="min-h-screen mb-40">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a3a3a3; }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #404040; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #525252; }
        
        .markdown-preview ul { list-style-type: disc !important; margin-left: 1.5rem !important; margin-bottom: 0.5rem !important; }
        .markdown-preview ol { list-style-type: decimal !important; margin-left: 1.5rem !important; margin-bottom: 0.5rem !important; }
        .markdown-preview li { display: list-item !important; margin-bottom: 0.25rem; }
        .markdown-preview p { margin-bottom: 0.75rem; }
        .markdown-preview strong, .markdown-preview b { font-weight: 900 !important; color: inherit; }
        .markdown-preview em, .markdown-preview i { font-style: italic !important; }
      `}</style>

      <div className="px-4 py-16 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20 -mt-12 md:mt-7 page-title invisible opacity-0">
          <h1 className="text-2xl md:text-4xl font-bold tracking-wide text-black dark:text-white">
            All Projects
          </h1>
          <p className="mt-4 font-sans text-neutral-600 dark:text-neutral-400 text-sm md:text-base max-w-xl mx-auto italic">
            "Projects that i created."
          </p>
        </div>

        {projects.length > 0 ? (
          <>
            {/* Desktop View */}
            <div className="hidden md:grid grid-cols-12 gap-6 lg:gap-10 desktop-view invisible opacity-0 max-w-6xl mx-auto">
              {/* Sidebar List */}
              <div className="col-span-4 lg:col-span-4">
                <div className="sticky top-28 max-h-[75vh] overflow-y-auto custom-scrollbar pr-4">
                  <ProjectSidebar 
                    projects={projects}
                    activeProject={activeProject}
                    onSelectProject={setActiveProject}
                  />
                </div>
              </div>
              
              {/* Content Detail */}
              <div className="col-span-8 lg:col-span-8">
                {activeProject && <ProjectContent project={activeProject} />}
              </div>
            </div>

            {/* Mobile Stacked View */}
            <div className="flex flex-col gap-16 md:hidden mobile-view invisible opacity-0">
              {projects.map((project) => (
                <div key={project.id} className="flex flex-col gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-12 last:border-0">
                  <h2 className="text-2xl font-black tracking-tight text-black dark:text-white leading-tight">
                    {project.title}
                  </h2>
                  <ProjectContent project={project} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center text-neutral-500 py-20">
            No projects found.
          </div>
        )}
      </div>
    </div>
  );
}
