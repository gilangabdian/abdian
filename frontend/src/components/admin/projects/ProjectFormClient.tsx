"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";

import { adminUploadProject, adminUpdateProject, getSingleProject } from "@/lib/api/project";
import { getSkills } from "@/lib/api/skill";
import { alertSuccess, alertError } from "@/lib/alert";
import { getToken } from "@/utils/auth";
import { Skill, Project } from "@/types";
import ProjectDescriptionEditor from "./ProjectDescriptionEditor";
import ProjectContent from "@/components/public/project/ProjectContent";

interface ProjectFormClientProps {
  isEditMode: boolean;
  projectId?: string;
}

const statusOptions = [
  { value: "completed", label: "Completed" },
  { value: "in_development", label: "In Development" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];
const typeOptions = [
  { value: "web_development", label: "Web Development" },
  { value: "mobile_development", label: "Mobile Development" },
  { value: "desktop_application", label: "Desktop Application" },
  { value: "game_development", label: "Game Development" },
];

export default function ProjectFormClient({ isEditMode, projectId }: ProjectFormClientProps) {
  const router = useRouter();
  const token = getToken();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSkills, setIsFetchingSkills] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    repository_link: "",
    live_demo_link: "",
    is_featured: false,
    start_date: "",
    end_date: "",
    status: "completed",
    type: "",
    team_size: "",
    role: "",
    youtube_url: "",
    twitter_url: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeMediaTab, setActiveMediaTab] = useState<"upload" | "youtube" | "twitter">("upload");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Custom Dropdown State
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const dropdownStatusRef = useRef<HTMLDivElement>(null);
  const dropdownTypeRef = useRef<HTMLDivElement>(null);

  // Custom Tech Stack State
  const [customTechStacks, setCustomTechStacks] = useState<{ name: string; icon_url: string }[]>([]);
  const [newCustomTechName, setNewCustomTechName] = useState("");
  const [newCustomTechIcon, setNewCustomTechIcon] = useState("");


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isStatusDropdownOpen &&
        dropdownStatusRef.current &&
        !dropdownStatusRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
      if (
        isTypeDropdownOpen &&
        dropdownTypeRef.current &&
        !dropdownTypeRef.current.contains(event.target as Node)
      ) {
        setIsTypeDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isStatusDropdownOpen, isTypeDropdownOpen]);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedSkills = await getSkills();
        setSkills(fetchedSkills);
      } catch (error) {
        console.error("Error fetching skills:", error);
        alertError("Gagal memuat skill.");
      } finally {
        setIsFetchingSkills(false);
      }

      if (isEditMode && projectId) {
        try {
          const data = await getSingleProject(projectId);
          if (data) {
            setForm({
              title: data.title || "",
              description: data.description || "",
              repository_link: data.repository_link || "",
              live_demo_link: data.live_demo_link || "",
              is_featured: !!data.is_featured,
              start_date: data.start_date ? data.start_date.substring(0, 10) : "",
              end_date: data.end_date ? data.end_date.substring(0, 10) : "",
              status: data.status || "completed",
              type: data.type || "",
              team_size: data.team_size ? String(data.team_size) : "",
              role: data.role || "",
              youtube_url: data.youtube_url || "",
              twitter_url: data.twitter_url || "",
            });

            if (data.youtube_url) {
              setActiveMediaTab("youtube");
            } else if (data.twitter_url) {
              setActiveMediaTab("twitter");
            } else {
              setActiveMediaTab("upload");
            }

            if (data.skills && Array.isArray(data.skills)) {
              setSelectedSkillIds(data.skills.map((item: any) => item.id));
            }

            if (data.custom_tech_stacks && Array.isArray(data.custom_tech_stacks)) {
              setCustomTechStacks(data.custom_tech_stacks);
            }

            if (data.thumbnail_path || data.thumbnail_url) {
              setPreviewImage(data.thumbnail_url || data.thumbnail_path || "");
            }
          }
        } catch (error) {
          console.error(error);
          alertError("Gagal mengambil data project.");
          router.push("/admin/projects");
        }
      }
    }
    fetchData();
  }, [isEditMode, projectId, router]);

  const toggleSkill = (id: number) => {
    setSelectedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addCustomTech = () => {
    if (newCustomTechName.trim() && newCustomTechIcon.trim()) {
      setCustomTechStacks((prev) => [
        ...prev,
        { name: newCustomTechName.trim(), icon_url: newCustomTechIcon.trim() },
      ]);
      setNewCustomTechName("");
      setNewCustomTechIcon("");
    }
  };

  const removeCustomTech = (index: number) => {
    setCustomTechStacks((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      alertError("Judul wajib diisi!");
      return;
    }
    if (!isEditMode && !file) {
      alertError("Thumbnail wajib diisi untuk project baru!");
      return;
    }

    setIsLoading(true);
    try {
      if (!token) throw new Error("No token");

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description || "");
      formData.append("repository_link", form.repository_link || "");
      formData.append("live_demo_link", form.live_demo_link || "");
      formData.append("is_featured", form.is_featured ? "1" : "0");
      formData.append("start_date", form.start_date);
      formData.append("end_date", form.end_date || "");
      formData.append("status", form.status);
      formData.append("type", form.type || "");
      formData.append("team_size", form.team_size || "");
      formData.append("role", form.role || "");

      // Handle active tab
      if (activeMediaTab === "upload") {
        formData.append("youtube_url", "");
        formData.append("twitter_url", "");
        if (file) {
          formData.append("thumbnail", file);
        }
      } else if (activeMediaTab === "youtube") {
        formData.append("youtube_url", form.youtube_url || "");
        formData.append("twitter_url", "");
      } else if (activeMediaTab === "twitter") {
        formData.append("youtube_url", "");
        formData.append("twitter_url", form.twitter_url || "");
      }

      selectedSkillIds.forEach((id) => {
        formData.append("tech_stack_ids[]", String(id));
      });

      if (customTechStacks.length > 0) {
        formData.append("custom_tech_stacks", JSON.stringify(customTechStacks));
      }

      let response;
      if (isEditMode && projectId) {
        formData.append("_method", "PUT");
        response = await adminUpdateProject(token, projectId, formData);
      } else {
        response = await adminUploadProject(token, formData);
      }

      if (response.ok || response.status === 201 || response.status === 200) {
        await alertSuccess(isEditMode ? "Project berhasil diupdate! 🚀" : "Project berhasil diluncurkan! 🚀");
        router.push("/admin/projects");
      } else {
        const responseBody = await response.json();
        await alertError(responseBody.message || "Gagal menyimpan project");
      }
    } catch (error) {
      console.error(error);
      alertError("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviewProjectData = (): Project => {
    return {
      id: 99999,
      title: form.title || "Project Title",
      slug: "preview-project",
      short_description: "",
      description: form.description || "Project description will appear here.",
      client_name: "",
      role: form.role,
      start_date: form.start_date,
      end_date: form.end_date,
      repository_link: form.repository_link,
      live_demo_link: form.live_demo_link,
      is_featured: form.is_featured,
      order_number: 0,
      type: form.type,
      status: form.status,
      team_size: Number(form.team_size) || 1,
      youtube_url: activeMediaTab === "youtube" ? form.youtube_url : "",
      twitter_url: activeMediaTab === "twitter" ? form.twitter_url : "",
      thumbnail_url: activeMediaTab === "upload" ? previewImage || undefined : undefined,
      media_type: previewImage?.match(/\.(mp4|webm|mov|mkv)$/i) || file?.type.startsWith("video/") ? "video" : "image",
      skills: skills.filter(s => selectedSkillIds.includes(s.id)),
      custom_tech_stacks: customTechStacks,
    };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20">
      <div className="mb-8">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 font-bold font-mono text-sm mb-4 hover:underline hover:text-gray-500 transition-colors"
        >
          <Icon icon="lucide:arrow-left" className="text-lg" />
          BACK TO LIST
        </Link>

        <div className="border-b-4 border-black pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-black italic uppercase">
              {isEditMode ? "EDIT PROJECT" : "UPLOAD PROJECT"}
            </h1>
            <p className="font-mono text-gray-600 mt-2 text-sm md:text-base">
              {isEditMode ? "Refine your masterpiece." : "Showcase your latest masterpiece."}
            </p>
          </div>
          <div className="hidden md:block bg-black text-white px-3 py-1 font-mono font-bold uppercase transform rotate-2 shadow-[4px_4px_0px_0px_rgba(200,200,200,1)]">
            {isEditMode ? "Update Mode" : "Create New"}
          </div>
        </div>
      </div>

      <div className="border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white mb-12">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div>
              <label className="block font-black mb-2 border-b-2 border-black inline-block text-sm uppercase">
                Project Title
                <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                type="text"
                placeholder="e.g. THE NEXT BIG APP"
                className="w-full p-4 border-2 border-black font-bold focus:bg-gray-50 focus:outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:font-normal placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block font-black mb-2 flex justify-between items-end text-sm uppercase">
                <span className="border-b-2 border-black inline-block">
                  Description <span className="text-red-500">*</span>
                </span>
              </label>
              <ProjectDescriptionEditor
                value={form.description}
                onChange={(val) => setForm({ ...form, description: val })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
                  <Icon icon="lucide:calendar" className="text-lg" />
                  Start Date
                  <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  type="date"
                  className="w-full p-3 border-2 border-black font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
              <div>
                <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
                  <Icon icon="lucide:calendar-check" className="text-lg" />
                  End Date
                  <span className="text-gray-400 text-[10px] normal-case ml-1">(Leave empty for &quot;Ongoing&quot;)</span>
                </label>
                <input
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  type="date"
                  className="w-full p-3 border-2 border-black font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative" ref={dropdownStatusRef}>
                <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
                  <Icon icon="lucide:activity" className="text-lg" />
                  Status
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative z-20">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsStatusDropdownOpen(!isStatusDropdownOpen);
                    }}
                    className={`w-full font-mono bg-white flex justify-between items-center focus:outline-none transition-all text-left text-sm border-2 border-black px-3 ${
                      isStatusDropdownOpen
                        ? "border-b-0 pb-[14px] pt-3 bg-white shadow-none"
                        : "py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    }`}
                  >
                    <span className="truncate">
                      {statusOptions.find((o) => o.value === form.status)?.label || "Select Status"}
                    </span>
                    <Icon
                      icon="lucide:chevron-down"
                      className={`transition-transform duration-200 ${isStatusDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isStatusDropdownOpen && (
                    <div className="absolute top-full left-0 w-full bg-white border-2 border-t-0 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto">
                      {statusOptions.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setForm({ ...form, status: opt.value });
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`p-3 border-b-2 border-black last:border-b-0 cursor-pointer text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-between group font-bold ${
                            form.status === opt.value ? "bg-gray-200" : ""
                          }`}
                        >
                          <span>{opt.label}</span>
                          {form.status === opt.value && <Icon icon="lucide:check" className="text-black group-hover:text-black" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative" ref={dropdownTypeRef}>
                <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
                  <Icon icon="lucide:folder-type" className="text-lg" />
                  Type
                  <span className="text-gray-400 text-[10px] normal-case ml-1">(optional)</span>
                </label>
                <div className="relative z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTypeDropdownOpen(!isTypeDropdownOpen);
                    }}
                    className={`w-full font-mono bg-white flex justify-between items-center focus:outline-none transition-all text-left text-sm border-2 border-black px-3 ${
                      isTypeDropdownOpen
                        ? "border-b-0 pb-[14px] pt-3 bg-white shadow-none"
                        : "py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    }`}
                  >
                    <span className="truncate">
                      {form.type ? typeOptions.find((o) => o.value === form.type)?.label : "— No Type —"}
                    </span>
                    <Icon
                      icon="lucide:chevron-down"
                      className={`transition-transform duration-200 ${isTypeDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isTypeDropdownOpen && (
                    <div className="absolute top-full left-0 w-full bg-white border-2 border-t-0 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto">
                      <div
                        onClick={() => {
                          setForm({ ...form, type: "" });
                          setIsTypeDropdownOpen(false);
                        }}
                        className={`p-3 border-b-2 border-black last:border-b-0 cursor-pointer text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-between group font-bold ${
                          form.type === "" ? "bg-gray-200" : ""
                        }`}
                      >
                        <span>— No Type —</span>
                        {form.type === "" && <Icon icon="lucide:check" className="text-black group-hover:text-black" />}
                      </div>
                      {typeOptions.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setForm({ ...form, type: opt.value });
                            setIsTypeDropdownOpen(false);
                          }}
                          className={`p-3 border-b-2 border-black last:border-b-0 cursor-pointer text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-between group font-bold ${
                            form.type === opt.value ? "bg-gray-200" : ""
                          }`}
                        >
                          <span>{opt.label}</span>
                          {form.type === opt.value && <Icon icon="lucide:check" className="text-black group-hover:text-black" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
                  <Icon icon="mdi:github" className="text-lg" />
                  Repository
                </label>
                <input
                  value={form.repository_link}
                  onChange={(e) => setForm({ ...form, repository_link: e.target.value })}
                  type="url"
                  placeholder="https://github.com/..."
                  className="w-full p-3 border-2 border-black font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
              <div>
                <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
                  <Icon icon="mdi:web" className="text-lg" />
                  Live Demo
                </label>
                <input
                  value={form.live_demo_link}
                  onChange={(e) => setForm({ ...form, live_demo_link: e.target.value })}
                  type="url"
                  placeholder="https://mysite.com"
                  className="w-full p-3 border-2 border-black font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
                  <Icon icon="lucide:calculator" className="text-lg" />
                  Team Size
                  <span className="text-gray-400 text-[10px] normal-case ml-1">(total people)</span>
                </label>
                <input
                  value={form.team_size}
                  onChange={(e) => setForm({ ...form, team_size: e.target.value })}
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  className="w-full p-3 border-2 border-black font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
              <div>
                <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
                  <Icon icon="lucide:user-cog" className="text-lg" />
                  Your Role
                  <span className="text-gray-400 text-[10px] normal-case ml-1">(e.g. Fullstack)</span>
                </label>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  type="text"
                  placeholder="e.g. Lead Developer"
                  className="w-full p-3 border-2 border-black font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </div>

            <div className="border-2 border-black bg-gray-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-transform hover:-translate-y-1">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="peer h-6 w-6 cursor-pointer appearance-none border-2 border-black bg-white transition-all checked:bg-black checked:bg-[url('https://api.iconify.design/lucide/check.svg?color=white')] checked:bg-center checked:bg-no-repeat"
                />
                <label htmlFor="is_featured" className="ml-3 font-black uppercase cursor-pointer select-none text-lg">
                  Feature Project?
                </label>
              </div>
              <div className="text-xs font-mono text-gray-500 border-l-2 border-black pl-4 hidden sm:block">
                Pinned to Homepage
                <br />
                Hero Section.
              </div>
            </div>

            <div className="pt-2 border-t-2 border-black border-dashed mt-4">
              <label className="block font-black mb-3 border-b-2 border-black inline-block text-sm uppercase mt-4">
                Main Tech Stack
                <span className="text-gray-400 text-[10px] normal-case ml-1">(optional)</span>
              </label>

              {isFetchingSkills ? (
                <div className="p-4 border-2 border-black border-dashed bg-gray-50 text-center font-mono animate-pulse">
                  LOADING TECH DATA...
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`group relative px-4 py-2 text-sm font-bold border-2 border-black transition-all duration-200 select-none flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] ${
                        selectedSkillIds.includes(skill.id)
                          ? "bg-black text-white hover:bg-gray-800"
                          : "bg-white text-black hover:bg-green-50"
                      }`}
                    >
                      <Icon
                        icon={skill.identifier || "lucide:code"}
                        className={`text-lg ${
                          selectedSkillIds.includes(skill.id) ? "text-white" : "text-gray-700 group-hover:text-black"
                        }`}
                      />
                      <span className="font-mono uppercase">{skill.name}</span>
                      {selectedSkillIds.includes(skill.id) && (
                        <div className="absolute -top-2 -right-2 bg-black text-white hover:text-black hover:bg-gray-100 border-2 border-black w-5 h-5 flex items-center justify-center rounded-full text-xs">
                          <Icon icon="lucide:check" strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t-2 border-black border-dashed">
              <label className="block font-black mb-3 border-b-2 border-black inline-block text-sm uppercase">
                Custom Tech Stacks
                <span className="text-gray-400 text-[10px] normal-case ml-1">(For project-specific tech)</span>
              </label>

              {customTechStacks.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4 p-4 border-2 border-black border-dashed bg-gray-50">
                  <div className="w-full text-xs font-black uppercase text-gray-400 mb-1">Added Custom Tech:</div>
                  {customTechStacks.map((tech, index) => (
                    <div
                      key={index}
                      className="relative px-4 py-2 text-sm font-bold border-2 border-black bg-yellow-100 text-black flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <Icon icon={tech.icon_url || "lucide:code"} className="text-lg" />
                      <span className="font-mono uppercase">{tech.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCustomTech(index);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600 border-2 border-black w-5 h-5 flex items-center justify-center rounded-full text-xs transition-colors"
                      >
                        <Icon icon="lucide:x" strokeWidth={4} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-end gap-4 p-4 border-2 border-black bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-full sm:w-2/5">
                  <label className="block font-black text-xs uppercase mb-1">Tech Name</label>
                  <input
                    value={newCustomTechName}
                    onChange={(e) => setNewCustomTechName(e.target.value)}
                    type="text"
                    placeholder="e.g. Figma"
                    className="w-full p-2 border-2 border-black font-mono text-sm focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomTech();
                      }
                    }}
                  />
                </div>
                <div className="w-full sm:w-2/5">
                  <label className="block font-black text-xs uppercase mb-1">Iconify Name</label>
                  <input
                    value={newCustomTechIcon}
                    onChange={(e) => setNewCustomTechIcon(e.target.value)}
                    type="text"
                    placeholder="e.g. logos:figma"
                    className="w-full p-2 border-2 border-black font-mono text-sm focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomTech();
                      }
                    }}
                  />
                </div>
                <div className="w-full sm:w-1/5">
                  <button
                    type="button"
                    onClick={addCustomTech}
                    className="w-full h-[40px] bg-black text-white font-black uppercase text-sm border-2 border-black hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-1"
                  >
                    <Icon icon="lucide:plus" /> ADD
                  </button>
                </div>
              </div>

              <p className="font-mono text-xs text-gray-500 mt-3 text-right">
                {selectedSkillIds.length} Main Tech + {customTechStacks.length} Custom Tech Selected
              </p>
            </div>
          </div>

          <div className="w-full lg:w-[350px] flex flex-col gap-6 flex-shrink-0">
            <div className="bg-gray-50 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <label className="block font-black mb-4 border-b-2 border-black inline-block text-sm uppercase">
                Project Media
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>

              <div className="flex gap-2 mb-4 border-b-2 border-black pb-2">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab("upload")}
                  className={`text-xs font-bold uppercase px-2 py-1 border-2 border-black ${
                    activeMediaTab === "upload" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  <Icon icon="lucide:upload" className="inline mr-1" /> File
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab("youtube")}
                  className={`text-xs font-bold uppercase px-2 py-1 border-2 border-black ${
                    activeMediaTab === "youtube" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  <Icon icon="logos:youtube-icon" className="inline mr-1" /> YT
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab("twitter")}
                  className={`text-xs font-bold uppercase px-2 py-1 border-2 border-black ${
                    activeMediaTab === "twitter" ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  <Icon icon="ri:twitter-x-line" className="inline mr-1" /> X
                </button>
              </div>

              {activeMediaTab === "upload" && (
                <div
                  className="relative w-full aspect-[4/3] border-4 border-black bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    id="file-upload"
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,video/*,.mkv,video/x-matroska"
                    onChange={handleFileChange}
                  />

                  {previewImage ? (
                    <div className="relative w-full h-full p-2 bg-white">
                      {previewImage.match(/\.(mp4|webm|mov|mkv)$/i) || file?.type.startsWith("video/") ? (
                        <video src={previewImage} className="w-full h-full object-cover border-2 border-black" autoPlay muted loop playsInline />
                      ) : (
                        <img loading="lazy" src={previewImage} className="w-full h-full object-cover border-2 border-black" alt="Preview" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        type="button"
                        className="absolute top-0 right-0 bg-white text-black hover:bg-black hover:text-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform z-10"
                        title="Remove Image"
                      >
                        <Icon icon="lucide:trash-2" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-4 space-y-2">
                      <div className="bg-white p-3 inline-block border-2 border-black group-hover:scale-110 transition-transform duration-300">
                        <Icon icon="lucide:image-plus" className="text-3xl text-black" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase">{isEditMode ? "Change Media" : "Upload Media"}</h4>
                        <p className="text-[10px] font-mono text-gray-500">Max 100MB (JPG/PNG/MP4/MKV)</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeMediaTab === "youtube" && (
                <div className="space-y-2">
                  <label className="block font-black text-xs uppercase flex items-center gap-2">
                    <Icon icon="logos:youtube-icon" className="text-lg" />
                    YouTube URL
                  </label>
                  <input
                    value={form.youtube_url}
                    onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full p-3 border-2 border-black font-mono text-sm focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-500 font-mono">
                    Pastikan URL valid dari YouTube.
                  </p>
                </div>
              )}

              {activeMediaTab === "twitter" && (
                <div className="space-y-2">
                  <label className="block font-black text-xs uppercase flex items-center gap-2">
                    <Icon icon="ri:twitter-x-line" className="text-lg" />
                    Twitter / X URL
                  </label>
                  <input
                    value={form.twitter_url}
                    onChange={(e) => setForm({ ...form, twitter_url: e.target.value })}
                    type="url"
                    placeholder="https://x.com/username/status/..."
                    className="w-full p-3 border-2 border-black font-mono text-sm focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-500 font-mono">
                    Masukkan link tweet yang mengandung video.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t-4 border-black border-dashed flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="w-full py-3 bg-white text-black hover:bg-gray-100 border-2 border-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 uppercase"
              >
                <Icon icon="lucide:eye" />
                Preview Project
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-black text-white hover:text-black hover:bg-gray-100 border-2 border-black font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-800 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase italic"
              >
                {isLoading ? (
                  <>
                    <Icon icon="svg-spinners:3-dots-fade" className="text-2xl" />
                    <span>{isEditMode ? "Updating..." : "Uploading..."}</span>
                  </>
                ) : (
                  <>
                    <span>{isEditMode ? "Update Project" : "Launch Project"}</span>
                    <Icon icon="lucide:rocket" />
                  </>
                )}
              </button>

              <Link
                href="/admin/projects"
                className="w-full py-3 bg-white text-black border-2 border-black font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white border-b-4 border-black p-4 flex justify-between items-center shadow-md">
            <h2 className="font-black italic uppercase text-xl md:text-2xl">
              Project Preview
            </h2>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-2 bg-black text-white font-bold uppercase border-2 border-black hover:bg-white hover:text-black transition-colors"
            >
              Close Preview
            </button>
          </div>
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <ProjectContent project={getPreviewProjectData()} />
          </div>
        </div>
      )}

    </div>
  );
}
