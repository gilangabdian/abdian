"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Project } from "@/types";
import ProjectSidebar from "../project/ProjectSidebar";
import ProjectContent from "../project/ProjectContent";

interface FeaturedProjectProps {
  projects: Project[];
}

export default function FeaturedProject({ projects = [] }: FeaturedProjectProps) {
  const featuredProjects = useMemo(() => {
    return [...(projects || [])].slice(0, 3).map((p) => {
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
  }, [projects]);

  const [activeProject, setActiveProject] = useState<Project | null>(
    featuredProjects.length > 0 ? featuredProjects[0] : null
  );

  if (!featuredProjects || featuredProjects.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 md:px-10 bg-white dark:bg-black relative z-0">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-black dark:text-white mb-6 font-sans tracking-wider inline-block relative border-b border-black/20 dark:border-white/20 pb-2">
            <span className="relative z-10">Featured Projects</span>
          </h2>
        </div>

        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-12 gap-6 lg:gap-10 desktop-view max-w-6xl mx-auto">
          {/* Sidebar List */}
          <div className="col-span-4 lg:col-span-4">
            <div className="sticky top-28 flex flex-col h-full max-h-[75vh]">
              <div className="overflow-y-auto custom-scrollbar pr-4">
                <ProjectSidebar 
                  projects={featuredProjects}
                  activeProject={activeProject}
                  onSelectProject={setActiveProject}
                />
              </div>
              
              {/* View All Projects Link - Desktop */}
              <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 font-bold hover:text-black dark:hover:text-white transition-colors uppercase tracking-wider text-sm"
                >
                  View All Projects
                  <Icon icon="lucide:arrow-right" className="text-lg" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Content Detail */}
          <div className="col-span-8 lg:col-span-8">
            {activeProject && <ProjectContent project={activeProject} />}
          </div>
        </div>

        {/* Mobile Stacked View */}
        <div className="flex flex-col gap-16 md:hidden mobile-view">
          {featuredProjects.map((project) => (
            <div key={project.id} className="flex flex-col gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-12 last:border-b-0 last:pb-0">
              <h2 className="text-2xl font-black tracking-tight text-black dark:text-white leading-tight">
                {project.title}
              </h2>
              <ProjectContent project={project} />
            </div>
          ))}
          
          {/* View All Projects Link - Mobile */}
          <div className="mt-4 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex justify-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white dark:bg-white dark:text-black border border-transparent font-black uppercase tracking-wider text-sm shadow-md hover:scale-105 transition-all rounded-lg"
            >
              View All Projects
              <Icon icon="lucide:arrow-right" className="text-lg" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
