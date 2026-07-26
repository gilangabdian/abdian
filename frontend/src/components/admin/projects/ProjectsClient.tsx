"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { getAllProjects, adminDeleteProject, adminUpdateProject } from "@/lib/api/project";
import { alertSuccess, alertError, alertConfirmProject } from "@/lib/alert";

import { Project } from "@/types";
import { getToken } from "@/utils/auth";

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = getToken();



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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const fetchedProjects = await getAllProjects();
      const mapped = fetchedProjects.map((p) => {
        const customTechs = (p.custom_tech_stacks || []).map((c) => ({
          id: `custom-${c.name}`,
          name: c.name,
          identifier: c.icon_url,
          category: "Custom",
        }));
        return {
          ...p,
          skills: [...(p.skills || []), ...customTechs],
        };
      });
      setProjects(mapped);
    } catch (error) {
      console.error(error);
      alertError("Gagal mengambil data project.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await alertConfirmProject("Yakin ingin menghapus project ini?");
    if (!isConfirmed) return;

    try {
      if (!token) throw new Error("No token");
      const response = await adminDeleteProject(token, id);
      if (response.ok) {
        await alertSuccess("Project berhasil dihapus! 🗑️");
        fetchData();
      } else {
        await alertError("Gagal menghapus data.");
      }
    } catch (error) {
      alertError("Terjadi kesalahan sistem.");
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    const oldStatus = project.is_featured;
    
    // Optimistic Update
    setProjects((prev) => 
      prev.map((p) => p.id === project.id ? { ...p, is_featured: !oldStatus } : p)
    );

    try {
      if (!token) throw new Error("No token");
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("title", project.title);
      formData.append("description", project.description || "");
      formData.append("is_featured", !oldStatus ? "1" : "0");
      formData.append("start_date", project.start_date ? project.start_date.substring(0, 10) : "");
      formData.append("end_date", project.end_date ? project.end_date.substring(0, 10) : "");
      formData.append("status", project.status || "completed");

      const response = await adminUpdateProject(token, project.id, formData);

      if (!response.ok) {
        throw new Error("Gagal update");
      }
    } catch (error) {
      console.error(error);
      // Rollback
      setProjects((prev) => 
        prev.map((p) => p.id === project.id ? { ...p, is_featured: oldStatus } : p)
      );
      alertError("Gagal mengubah status featured.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10 border-b-4 border-black pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase">MANAGE PROJECTS</h1>
          <p className="font-mono text-gray-600 mt-2">Edit or remove your masterpieces.</p>
        </div>

        {!isLoading && projects.length > 0 && (
          <Link
            href="/admin/projects/create"
            className="bg-black text-white hover:text-black hover:bg-gray-100 border-2 border-black px-4 py-2 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2"
          >
            <Icon icon="lucide:plus" className="text-xl" />
            <span>Add New</span>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="p-8 text-center font-mono animate-pulse border-4 border-black bg-white">
          LOADING PROJECTS...
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-4">
          <div className="bg-gray-100 p-4 rounded-full border-2 border-black">
            <Icon icon="lucide:rocket" className="text-4xl text-gray-400" />
          </div>
          <div>
            <h3 className="font-bold text-xl uppercase mb-1">No Projects Found</h3>
            <p className="font-mono text-gray-500 mb-6">You haven't launched any projects yet.</p>
            <Link
              href="/admin/projects/create"
              className="inline-flex flex-col items-center justify-center gap-1 bg-black text-white hover:text-black hover:bg-gray-100 border-2 border-black px-5 py-2 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform text-sm"
            >
              <Icon icon="lucide:plus-circle" className="text-xl" />
              <span>Launch Project!</span>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {/* Desktop Table */}
          <div className="hidden md:block border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-black text-white font-mono uppercase text-sm">
                <tr>
                  <th className="p-4 border-r-2 border-white w-24">Thumbnail</th>
                  <th className="p-4 border-r-2 border-white">Project Info</th>
                  <th className="p-4 border-r-2 border-white text-center w-28">Status</th>
                  <th className="p-4 border-r-2 border-white text-center w-32">Role/Team</th>
                  <th className="p-4 border-r-2 border-white text-center w-24">Featured</th>
                  <th className="p-4 border-r-2 border-white w-1/4">Tech Stack</th>
                  <th className="p-4 text-center w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b-2 border-black hover:bg-gray-50 transition-colors">
                    <td className="p-4 align-top">
                      {project.media_type === "video" && project.thumbnail_url ? (
                        <video
                          src={project.thumbnail_url}
                          className="w-24 h-16 object-cover border-2 border-black shadow-sm"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img
                          loading="lazy"
                          src={project.thumbnail_url || project.thumbnail_path || ""}
                          className="w-24 h-16 object-cover border-2 border-black shadow-sm"
                          alt={project.title}
                        />
                      )}
                    </td>

                    <td className="p-4 align-top">
                      <div className="max-w-[250px] lg:max-w-[400px]">
                        <div className="font-bold uppercase text-lg leading-tight mb-1">{project.title}</div>
                        <div
                          dangerouslySetInnerHTML={{ __html: project.description || "" }}
                          className="markdown-preview text-sm text-gray-500 font-mono mb-2 line-clamp-2"
                        ></div>
                        <div className="flex gap-3 mt-2">
                          {project.repository_link && (
                            <a
                              href={project.repository_link}
                              target="_blank"
                              className="text-gray-600 hover:text-black hover:scale-110 transition-transform"
                            >
                              <Icon icon="mdi:github" className="w-6 h-6" />
                            </a>
                          )}
                          {project.live_demo_link && (
                            <a
                              href={project.live_demo_link}
                              target="_blank"
                              className="text-gray-600 hover:text-black underline hover:scale-110 transition-transform"
                            >
                              <Icon icon="mdi:web" className="w-6 h-6" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center align-top">
                      <div className="flex flex-col items-center gap-1.5">
                        {project.status && (
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 border rounded-sm whitespace-nowrap ${statusClass(
                              project.status
                            )}`}
                          >
                            {formatLabel(project.status)}
                          </span>
                        )}
                        {project.type && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 border border-black rounded-sm bg-gray-50 whitespace-nowrap">
                            {formatLabel(project.type)}
                          </span>
                        )}
                        {project.start_date && (
                          <span className="text-[9px] font-mono text-gray-400 whitespace-nowrap">
                            {formatDate(project.start_date)} →{" "}
                            {project.end_date ? formatDate(project.end_date) : "Ongoing"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center align-top border-r-2 border-black/5 last:border-r-0">
                      <div className="flex flex-col items-center gap-1">
                        {project.role && (
                          <span className="text-xs font-bold uppercase truncate max-w-[120px]" title={project.role}>
                            {project.role}
                          </span>
                        )}
                        {project.team_size && (
                          <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1 rounded flex items-center gap-1">
                            <Icon icon="lucide:users" className="w-3 h-3" />
                            {project.team_size} {project.team_size > 1 ? "people" : "person"}
                          </span>
                        )}
                        {!project.role && !project.team_size && <span className="text-gray-300 text-xs">—</span>}
                      </div>
                    </td>

                    <td className="p-4 text-center align-top">
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        title={project.is_featured ? "Unfeature Project" : "Feature Project"}
                      >
                        <Icon
                          icon={project.is_featured ? "lucide:star" : "lucide:star-off"}
                          className={`w-6 h-6 transition-all duration-300 ${
                            project.is_featured ? "text-black text-yellow-500 scale-110" : "text-gray-300"
                          }`}
                        />
                      </button>
                    </td>

                    <td className="p-4 align-top">
                      {project.skills && project.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.skills.map((tech) => (
                            <span
                              key={tech.id}
                              className="text-xs border border-black px-2 py-1 bg-white flex items-center gap-1 font-mono"
                            >
                              <Icon icon={tech.identifier || "lucide:code"} className="w-4 h-4" />
                              {tech.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center align-middle">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/admin/projects/edit/${project.id}`}
                          className="bg-gray-200 hover:bg-gray-500 text-black p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform"
                        >
                          <Icon icon="lucide:pencil" className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="bg-red-500 text-white hover:bg-red-600 p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform"
                        >
                          <Icon icon="lucide:trash-2" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="md:hidden space-y-6">
            {projects.map((project) => (
              <div
                key={`${project.id}-mobile`}
                className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4 relative"
              >
                <button
                  onClick={() => handleToggleFeatured(project)}
                  className="absolute top-2 right-2 p-2 bg-white border-2 border-black rounded-full z-10 shadow-sm"
                >
                  <Icon
                    icon={project.is_featured ? "lucide:star" : "lucide:star-off"}
                    className={`w-5 h-5 ${project.is_featured ? "text-yellow-500" : "text-gray-300"}`}
                  />
                </button>

                <div className="flex gap-4 items-start">
                  {project.media_type === "video" && project.thumbnail_url ? (
                    <video
                      src={project.thumbnail_url}
                      className="w-20 h-20 object-cover border-2 border-black flex-shrink-0 bg-gray-100"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      loading="lazy"
                      src={project.thumbnail_url || project.thumbnail_path || ""}
                      className="w-20 h-20 object-cover border-2 border-black flex-shrink-0 bg-gray-100"
                      alt={project.title}
                    />
                  )}
                  <div className="flex-1 min-w-0 pr-8">
                    <h3 className="font-black text-lg uppercase leading-tight break-words">{project.title}</h3>
                    <div
                      dangerouslySetInnerHTML={{ __html: project.description || "" }}
                      className="markdown-preview text-sm text-gray-500 font-mono mb-2 line-clamp-2"
                    ></div>
                    <div className="flex gap-3 mt-3">
                      {project.repository_link && (
                        <a
                          href={project.repository_link}
                          target="_blank"
                          className="w-8 h-8 flex items-center justify-center border-2 border-black bg-gray-100 hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                        >
                          <Icon icon="mdi:github" className="w-5 h-5" />
                        </a>
                      )}
                      {project.live_demo_link && (
                        <a
                          href={project.live_demo_link}
                          target="_blank"
                          className="w-8 h-8 flex items-center justify-center border-2 border-black bg-gray-100 hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                        >
                          <Icon icon="mdi:web" className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-t-2 border-black border-dashed pt-3">
                  <p className="text-xs font-bold uppercase mb-2">Tech Stack:</p>
                  <div className="flex flex-wrap gap-2">
                    {project.skills?.map((tech) => (
                      <span
                        key={tech.id}
                        className="text-[10px] border border-black px-1.5 py-0.5 bg-gray-50 flex items-center gap-1 font-mono"
                      >
                        <Icon icon={tech.identifier || "lucide:code"} className="w-3 h-3" />
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="border-t-2 border-black border-dashed pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.status && (
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 border rounded-sm ${statusClass(
                          project.status
                        )}`}
                      >
                        {formatLabel(project.status)}
                      </span>
                    )}
                    {project.type && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 border border-black rounded-sm bg-gray-50">
                        {formatLabel(project.type)}
                      </span>
                    )}
                    {project.start_date && (
                      <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                        <Icon icon="lucide:calendar" className="w-3 h-3" />
                        {formatDate(project.start_date)} → {project.end_date ? formatDate(project.end_date) : "Ongoing"}
                      </span>
                    )}
                    {project.role && (
                      <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded-sm font-bold uppercase flex items-center gap-1">
                        <Icon icon="lucide:user-cog" className="w-3 h-3" />
                        {project.role}
                      </span>
                    )}
                    {project.team_size && (
                      <span className="text-[10px] border border-black px-1.5 py-0.5 bg-gray-100 flex items-center gap-1 font-mono">
                        <Icon icon="lucide:users" className="w-3 h-3" />
                        Team: {project.team_size}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Link
                    href={`/admin/projects/edit/${project.id}`}
                    className="flex items-center justify-center gap-2 bg-gray-200 border-2 border-black py-2 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all text-black"
                  >
                    <Icon icon="lucide:pencil" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2 border-2 border-black py-2 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                  >
                    <Icon icon="lucide:trash-2" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        .markdown-preview ul {
          list-style-type: disc !important;
          margin-left: 1.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .markdown-preview ol {
          list-style-type: decimal !important;
          margin-left: 1.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .markdown-preview li {
          display: list-item !important;
        }
        .markdown-preview p {
          margin-bottom: 0.5rem;
        }
        .markdown-preview strong,
        .markdown-preview b {
          font-weight: 900 !important;
        }
        .markdown-preview em,
        .markdown-preview i {
          font-style: italic !important;
        }
      `}</style>
    </div>
  );
}
