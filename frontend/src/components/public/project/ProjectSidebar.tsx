import React from 'react';
import { Project } from '@/types';

interface ProjectSidebarProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (project: Project) => void;
}

export default function ProjectSidebar({ projects, activeProject, onSelectProject }: ProjectSidebarProps) {
  return (
    <div className="flex flex-col gap-4">
      {projects.map((project) => {
        const isActive = activeProject?.id === project.id;
        return (
          <button
            key={project.id}
            onClick={() => onSelectProject(project)}
            className={`text-left transition-colors duration-200 block w-full py-2 ${
              isActive
                ? 'text-black dark:text-white font-black text-2xl md:text-3xl tracking-tight'
                : 'text-neutral-400 dark:text-neutral-500 font-semibold text-xl hover:text-neutral-600 dark:hover:text-neutral-400'
            }`}
          >
            {project.title}
          </button>
        );
      })}
    </div>
  );
}
