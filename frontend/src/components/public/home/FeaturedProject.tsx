"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { marked } from "marked";
import { Project } from "@/types";

interface FeaturedProjectProps {
  projects: Project[];
}

// Tambahkan type untuk window events jika belum ada
declare global {
  interface WindowEventMap {
    popstate: PopStateEvent;
  }
}

const renderMarkdown = (text?: string) => {
  if (!text) return "";
  return marked.parse(text, { breaks: true }) as string;
};

const formatLabel = (value?: string) => {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const statusClass = (status?: string) => {
  const map: Record<string, string> = {
    completed: "bg-green-100 text-green-800 border-green-600",
    in_development: "bg-yellow-100 text-yellow-800 border-yellow-600",
    on_hold: "bg-gray-100 text-gray-700 border-gray-500",
    cancelled: "bg-red-100 text-red-800 border-red-600",
  };
  return status && map[status] ? map[status] : "bg-gray-100 text-gray-700 border-gray-500";
};

// Custom Scrollbar styles will be added in global CSS or a styled block
export default function FeaturedProject({ projects = [] }: FeaturedProjectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const featuredProjects = useMemo(() => {
    return [...(projects || [])].slice(0, 3).map((p) => {
      const customTechs = (p.custom_tech_stacks || []).map((c) => ({
        id: c.name, // Temporary ID for custom techs based on name
        name: c.name,
        identifier: c.icon_url,
      }));
      return {
        ...p,
        skills: [...(p.skills || []), ...customTechs],
      };
    });
  }, [projects]);

  useEffect(() => {
    const handlePopstate = () => {
      setIsModalOpen(false);
      document.body.style.overflow = "auto";
      setTimeout(() => {
        setSelectedProject(null);
      }, 200);
    };

    if (isModalOpen) {
      window.addEventListener("popstate", handlePopstate);
    }

    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [isModalOpen]);

  const openModal = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";

    // HISTORY API
    window.history.pushState({ modalOpen: true }, "", "");
  };

  const closeModal = () => {
    window.history.back();
  };

  return (
    <section className="py-20 px-4 md:px-10 bg-white relative z-0">
      {projects && projects.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-black mb-6 font-sans tracking-wider inline-block relative border-b border-black/20 pb-2">
              <span className="relative z-10">Featured Projects</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => openModal(project)}
                className="group flex flex-col p-3 bg-white rounded-xl border border-black/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <div className="w-full aspect-video bg-gray-50 border border-black/10 rounded-lg mb-3 overflow-hidden relative flex items-center justify-center">
                  {project.thumbnail_url || project.thumbnail_path ? (
                    <img
                      loading="lazy"
                      src={(project.thumbnail_url || project.thumbnail_path) as string}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                      <Icon icon="mdi:image-off-outline" className="text-3xl mb-2" />
                      <span className="text-[10px] font-bold uppercase">No Preview</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-grow px-1">
                  <h3 className="text-base font-bold font-sans leading-tight mb-2 group-hover:underline decoration-2 underline-offset-2">
                    {project.title}
                  </h3>

                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {project.skills.slice(0, 3).map((skill: any) => (
                        <div
                          key={skill.id || skill.name}
                          className="px-2 py-0.5 border border-black/10 rounded bg-gray-50 flex items-center gap-1 shadow-sm opacity-80 group-hover:opacity-100 transition-opacity"
                          title={skill.name}
                        >
                          {skill.identifier && (
                            <Icon icon={skill.identifier} className="w-3 h-3 text-black" />
                          )}
                          <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-wide leading-none">
                            {skill.name}
                          </span>
                        </div>
                      ))}
                      {project.skills.length > 3 && (
                        <div
                          className="px-1.5 py-0.5 border border-transparent rounded bg-gray-100 text-gray-500 flex items-center justify-center shadow-sm opacity-80 group-hover:opacity-100 transition-opacity"
                          title={project.skills
                            .slice(3)
                            .map((s: any) => s.name)
                            .join(", ")}
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

          <div className="mt-12 flex justify-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white border border-transparent font-black uppercase tracking-wider text-sm shadow-md hover:bg-black/90 hover:shadow-lg hover:-translate-y-1 transition-all rounded-lg"
            >
              View All Projects
              <Icon icon="lucide:arrow-right" className="text-lg" />
            </Link>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal}></div>

          <div className="relative bg-white w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-black/20 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start p-6 border-b border-black/10 bg-gray-50 rounded-t-lg shrink-0">
              <h3 className="text-2xl font-black font-sans uppercase pr-4 leading-none">
                {selectedProject?.title}
              </h3>

              <button
                onClick={closeModal}
                className="cursor-pointer hidden md:block p-1.5 bg-red-50 text-red-600 hover:bg-red-100 transition-colors rounded-full shrink-0 shadow-sm"
              >
                <Icon icon="mdi:close" className="text-xl" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="w-full aspect-video bg-gray-50 border border-black/10 rounded-lg mb-6 overflow-hidden flex-shrink-0">
                <img
                  loading="lazy"
                  src={(selectedProject?.thumbnail_url || selectedProject?.thumbnail_path) as string}
                  alt={selectedProject?.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {selectedProject?.skills && selectedProject.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold font-sans uppercase text-sm mb-3 border-b border-black/20 inline-block">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.skills.map((skill: any) => (
                      <div
                        key={skill.id || skill.name}
                        className="flex items-center gap-2 px-3 py-1.5 border border-black/10 rounded-md bg-gray-50 shadow-sm text-xs font-bold uppercase transition-transform hover:-translate-y-0.5 cursor-default text-gray-600"
                      >
                        {skill.identifier && <Icon icon={skill.identifier} className="text-base" />}
                        {skill.name}
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
                  <span className="text-xs font-bold uppercase px-2 py-1 border border-black/10 rounded-sm bg-gray-50 flex items-center gap-1.5">
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
                    <Icon icon="lucide:calendar" className="w-3.5 h-3.5" />
                    {formatDate(selectedProject.start_date)} →{" "}
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
                      <div className="flex items-center gap-2 font-bold text-sm uppercase">
                        <Icon icon="lucide:user-cog" className="text-lg" />
                        {selectedProject.role}
                      </div>
                    </div>
                  )}
                  {selectedProject?.team_size && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-gray-400 dark:text-white/50 mb-1">
                        Team Size:
                      </h4>
                      <div className="flex items-center gap-2 font-bold text-sm uppercase">
                        <Icon icon="lucide:users" className="text-lg" />
                        {selectedProject.team_size} {selectedProject.team_size > 1 ? "People" : "Person"}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <h4 className="font-bold font-sans uppercase text-sm mb-3 border-b border-black/20 inline-block">
                Description
              </h4>
              <div
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedProject?.description) }}
                className="markdown-preview font-mono text-sm md:text-base text-gray-700 leading-relaxed"
              ></div>
            </div>

            <div className="p-6 border-t border-black/10 bg-gray-50 rounded-b-lg shrink-0">
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  {selectedProject?.repository_link && (
                    <a
                      href={selectedProject.repository_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border border-black/20 rounded-lg bg-white hover:bg-gray-100 text-black transition-colors shadow-sm"
                    >
                      <Icon icon="mdi:github" className="text-xl" />
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
                      <Icon icon="mdi:external-link" className="text-xl" />
                      Live Demo
                    </a>
                  )}
                </div>

                <button
                  onClick={closeModal}
                  className="cursor-pointer w-full py-3 text-sm font-bold uppercase tracking-wider text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Icon icon="mdi:close-circle-outline" className="text-xl" />
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
