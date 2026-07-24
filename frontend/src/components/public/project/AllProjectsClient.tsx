"use client";

import { useState, useEffect, useRef } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import gsap from "gsap";
import { marked } from "marked";
import { Project } from "@/types";
import { Icon } from "@iconify/react";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Helper: Format enum value to readable label
  const formatLabel = (value?: string) => {
    if (!value) return "";
    return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Helper: Format date to "Jan 2025"
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  // Helper: Status badge color class
  const statusClass = (status?: string) => {
    const map: Record<string, string> = {
      completed: "bg-green-100 text-green-800 border-green-600",
      in_development: "bg-yellow-100 text-yellow-800 border-yellow-600",
      on_hold: "bg-gray-100 text-gray-700 border-gray-500",
      cancelled: "bg-red-100 text-red-800 border-red-600",
    };
    return status && map[status] ? map[status] : "bg-gray-100 text-gray-700 border-gray-500";
  };

  const renderMarkdown = (text?: string) => {
    if (!text) return "";
    return marked.parse(text, { breaks: true }) as string;
  };

  useEffect(() => {
    NProgress.done();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
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

      // 2. Animasi Kartu Project
      if (projects.length > 0) {
        tl.fromTo(
          ".project-card",
          { y: 30, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.6"
        );
      }
    }
  }, [projects.length]);

  const openModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
    setTimeout(() => {
      setSelectedProject(null);
    }, 200);
  };

  return (
    <div className="min-h-screen mb-40" ref={containerRef}>
      <style>{`
        /* Tambahan Style Transisi Modal */
        .fade-enter { opacity: 0; }
        .fade-enter-active { opacity: 1; transition: opacity 0.6s ease; }
        .fade-exit { opacity: 1; }
        .fade-exit-active { opacity: 0; transition: opacity 0.6s ease; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-left: 2px solid black; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: black; border: 1px solid white; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
        
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: #1a1a1a; border-left: 2px solid rgba(255,255,255,0.1); }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; border: 1px solid #1a1a1a; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
        
        .markdown-preview ul { list-style-type: disc !important; margin-left: 1.5rem !important; margin-bottom: 0.5rem !important; }
        .markdown-preview ol { list-style-type: decimal !important; margin-left: 1.5rem !important; margin-bottom: 0.5rem !important; }
        .markdown-preview li { display: list-item !important; margin-bottom: 0.25rem; }
        .markdown-preview p { margin-bottom: 0.75rem; }
        .markdown-preview strong, .markdown-preview b { font-weight: 900 !important; }
        .markdown-preview em, .markdown-preview i { font-style: italic !important; }
      `}</style>

      <div className="px-4 py-16 md:px-8 max-w-6xl mx-auto">
          <div>
            <div className="text-center mb-12 -mt-12 md:mt-7 page-title" style={{ opacity: 0, visibility: "hidden" }}>
              <h1 className="anim-text text-2xl md:text-3xl font-bold tracking-wide text-black dark:text-white">All Projects</h1>
              <p className="mt-4 font-sans text-gray-700 dark:text-gray-300 text-sm md:text-base max-w-xl mx-auto italic">
                "Projects that i created."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => openModal(project)}
                  className="project-card group flex flex-col p-3 bg-white dark:bg-[#1a1a1a] rounded-xl border border-black/20 dark:border-white/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                  style={{ opacity: 0, visibility: "hidden" }}
                >
                  <div className="w-full aspect-video bg-gray-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg mb-3 overflow-hidden relative flex items-center justify-center">
                    {project.thumbnail_url ? (
                      <img
                        loading="lazy"
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                        <Icon icon="mdi:image-off-outline" className="text-3xl mb-2"></Icon>
                        <span className="text-[10px] font-bold uppercase">No Preview</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-grow px-1">
                    <h3 className="text-base font-bold font-serif leading-tight mb-2 group-hover:underline decoration-2 underline-offset-2 text-black dark:text-white">
                      {project.title}
                    </h3>

                    {project.skills && project.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {project.skills.slice(0, 3).map((skill: any, i: number) => (
                          <div
                            key={skill.id || `skill-${i}`}
                            className="px-2 py-0.5 border border-black/10 dark:border-white/10 rounded bg-gray-50 dark:bg-black/50 flex items-center gap-1 shadow-sm opacity-80 group-hover:opacity-100 transition-opacity"
                            title={skill.name || skill}
                          >
                            {skill.identifier && (
                              <Icon icon={skill.identifier} className="w-3 h-3 text-black dark:text-white" />
                            )}
                            <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-wide leading-none text-black dark:text-white">
                              {skill.name || skill}
                            </span>
                          </div>
                        ))}
                        {/* Indicator +X if skills > 3 */}
                        {project.skills.length > 3 && (
                          <div
                            className="px-1.5 py-0.5 border border-transparent rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center shadow-sm opacity-80 group-hover:opacity-100 transition-opacity"
                            title={project.skills.slice(3).map((s: any) => s.name || s).join(', ')}
                          >
                            <span className="text-[9px] font-bold uppercase tracking-wide leading-none">
                              +{project.skills.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300" onClick={closeModal}></div>

          <div className="relative bg-white dark:bg-[#1a1a1a] w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-black/20 dark:border-white/20 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start p-6 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black/50 rounded-t-lg shrink-0">
              <h3 className="text-2xl font-black font-serif uppercase pr-4 leading-none text-black dark:text-white">
                {selectedProject?.title}
              </h3>

              <button
                onClick={closeModal}
                className="hidden md:block p-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors rounded-full shrink-0 shadow-sm"
              >
                <Icon icon="mdi:close" className="text-xl"></Icon>
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="w-full aspect-video bg-gray-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg mb-6 overflow-hidden flex-shrink-0">
                {selectedProject?.thumbnail_url ? (
                  <img
                    loading="lazy"
                    src={selectedProject.thumbnail_url}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex w-full h-full items-center justify-center text-gray-400">
                    <Icon icon="mdi:image-off-outline" className="text-4xl"></Icon>
                  </div>
                )}
              </div>

              {selectedProject?.skills && selectedProject.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold font-serif uppercase text-sm mb-3 border-b border-black/20 dark:border-white/20 inline-block text-black dark:text-white">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.skills.map((skill: any, i: number) => (
                      <div
                        key={skill.id || `modal-skill-${i}`}
                        className="flex items-center gap-2 px-3 py-1.5 border border-black/10 dark:border-white/10 rounded-md bg-gray-50 dark:bg-black/50 shadow-sm text-xs font-bold uppercase transition-transform hover:-translate-y-0.5 cursor-default text-gray-600 dark:text-gray-300"
                      >
                        {skill.identifier && (
                          <Icon icon={skill.identifier} className="text-base text-black dark:text-white" />
                        )}
                        {skill.name || skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedProject?.status && (
                  <span
                    className={`text-xs font-bold uppercase px-2 py-1 border-2 rounded-sm flex items-center gap-1.5 ${statusClass(
                      selectedProject.status
                    )}`}
                  >
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-normal">
                      Status:
                    </span>
                    {formatLabel(selectedProject.status)}
                  </span>
                )}
                {selectedProject?.type && (
                  <span className="text-xs font-bold uppercase px-2 py-1 border border-black/10 dark:border-white/10 rounded-sm bg-gray-50 dark:bg-black/50 flex items-center gap-1.5 text-black dark:text-white">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-normal">
                      Type:
                    </span>
                    {formatLabel(selectedProject.type)}
                  </span>
                )}
                {selectedProject?.start_date && (
                  <span className="text-xs font-mono text-gray-500 flex items-center gap-1 px-2 py-1">
                    <span className="text-[10px] uppercase tracking-wider font-mono font-normal">
                      Period:
                    </span>
                    <Icon icon="lucide:calendar" className="w-3.5 h-3.5"></Icon>
                    {formatDate(selectedProject.start_date)} &rarr;{" "}
                    {selectedProject.end_date ? formatDate(selectedProject.end_date) : "Ongoing"}
                  </span>
                )}
              </div>

              {(selectedProject?.role || selectedProject?.team_size) && (
                <div className="mb-6 p-4 border border-black/10 bg-gray-50/50 rounded-lg flex flex-wrap gap-6 text-gray-600 dark:bg-black/40 dark:text-white dark:border-white/10">
                  {selectedProject?.role && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-gray-400 dark:text-white/50 mb-1">
                        Role:
                      </h4>
                      <div className="flex items-center gap-2 font-bold text-sm uppercase text-black dark:text-white">
                        <Icon icon="lucide:user-cog" className="text-lg"></Icon>
                        {selectedProject.role}
                      </div>
                    </div>
                  )}
                  {selectedProject?.team_size && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-gray-400 dark:text-white/50 mb-1">
                        Team Size:
                      </h4>
                      <div className="flex items-center gap-2 font-bold text-sm uppercase text-black dark:text-white">
                        <Icon icon="lucide:users" className="text-lg"></Icon>
                        {selectedProject.team_size} {selectedProject.team_size > 1 ? "People" : "Person"}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <h4 className="font-bold font-serif uppercase text-sm mb-3 border-b border-black/20 dark:border-white/20 inline-block text-black dark:text-white">
                Description
              </h4>
              <div
                className="markdown-preview font-mono text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedProject?.description) }}
              ></div>
            </div>

            <div className="p-6 border-t border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black/50 rounded-b-lg shrink-0">
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  {selectedProject?.repository_link && (
                    <a
                      href={selectedProject.repository_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-white/10 text-black dark:text-white transition-colors shadow-sm"
                    >
                      <Icon icon="mdi:github" className="text-xl"></Icon>
                      View Code
                    </a>
                  )}
                  {selectedProject?.live_demo_link && (
                    <a
                      href={selectedProject.live_demo_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border border-transparent rounded-lg bg-black hover:bg-black/80 text-white dark:bg-white dark:hover:bg-gray-200 dark:!text-black transition-colors shadow-sm"
                    >
                      <Icon icon="mdi:external-link" className="text-xl"></Icon>
                      Live Demo
                    </a>
                  )}
                </div>

                <button
                  onClick={closeModal}
                  className="w-full py-3 text-sm font-bold uppercase tracking-wider text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Icon icon="mdi:close-circle-outline" className="text-xl"></Icon>
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
