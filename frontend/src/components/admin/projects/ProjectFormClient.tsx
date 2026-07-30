"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";

import { adminUploadProject, adminUpdateProject, getSingleProject } from "@/lib/api/project";
import { getSkills } from "@/lib/api/skill";
import { alertSuccess, alertError } from "@/lib/alert";
import { getToken } from "@/utils/auth";
import { Skill, CustomTechStack, Project } from "@/types";

import ProjectFormBasicFields, { ProjectFormData } from "./ProjectFormBasicFields";
import ProjectMediaUpload from "./ProjectMediaUpload";
import ProjectSkillSelector from "./ProjectSkillSelector";
import ProjectCustomTechStack from "./ProjectCustomTechStack";
import ProjectLivePreview from "./ProjectLivePreview";

interface ProjectFormClientProps {
  isEditMode: boolean;
  projectId?: string;
}

const DEFAULT_FORM: ProjectFormData = {
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
};

export default function ProjectFormClient({ isEditMode, projectId }: ProjectFormClientProps) {
  const router = useRouter();
  const token = getToken();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isFetchingSkills, setIsFetchingSkills] = useState(true);

  const [form, setForm] = useState<ProjectFormData>(DEFAULT_FORM);

  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [activeMediaTab, setActiveMediaTab] = useState<"upload" | "youtube" | "twitter">("upload");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Track apakah admin menghapus thumbnail saat edit mode
  const [removeThumbnailFlag, setRemoveThumbnailFlag] = useState(false);

  // Custom Tech Stack State
  const [customTechStacks, setCustomTechStacks] = useState<CustomTechStack[]>([]);
  const [newCustomTechName, setNewCustomTechName] = useState("");
  const [newCustomTechIcon, setNewCustomTechIcon] = useState("");

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

            // Reset hapus flag ketika data fresh
            setRemoveThumbnailFlag(false);
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

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewImage(URL.createObjectURL(selectedFile));
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFile(null);
    if (isEditMode) {
      setRemoveThumbnailFlag(true);
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
    setUploadProgress(0);
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

      // Kirim flag hapus jika di edit mode dan admin menghapus thumbnail
      if (isEditMode && removeThumbnailFlag) {
        formData.append("remove_thumbnail", "1");
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
        response = await adminUpdateProject(token, projectId, formData, (progress) => {
          setUploadProgress(progress);
        });
      } else {
        response = await adminUploadProject(token, formData, (progress) => {
          setUploadProgress(progress);
        });
      }

      if (response.ok || response.status === 201 || response.status === 200) {
        setUploadProgress(100);
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
      setUploadProgress(0);
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Project Media Upload */}
          <ProjectMediaUpload
            activeMediaTab={activeMediaTab}
            onTabChange={setActiveMediaTab}
            previewImage={previewImage}
            onFileSelect={handleFileSelect}
            onRemoveImage={removeImage}
            youtubeUrl={form.youtube_url}
            twitterUrl={form.twitter_url}
            onYoutubeUrlChange={(val) => setForm((prev) => ({ ...prev, youtube_url: val }))}
            onTwitterUrlChange={(val) => setForm((prev) => ({ ...prev, twitter_url: val }))}
            isEditMode={isEditMode}
            showRemoveWarning={removeThumbnailFlag}
          />

          {/* Basic Fields: Title, Description, Dates, Status, Type, Links, Team, Role, Featured */}
          <ProjectFormBasicFields
            form={form}
            onChange={setForm}
          />

          {/* Main Tech Stack */}
          <div className="pt-2 border-t-2 border-black border-dashed mt-4">
            <label className="block font-black mb-3 border-b-2 border-black inline-block text-sm uppercase mt-4">
              Main Tech Stack
              <span className="text-gray-400 text-[10px] normal-case ml-1">(optional)</span>
            </label>
            <ProjectSkillSelector
              skills={skills}
              selectedSkillIds={selectedSkillIds}
              isFetchingSkills={isFetchingSkills}
              onToggleSkill={toggleSkill}
            />
          </div>

          {/* Custom Tech Stack */}
          <ProjectCustomTechStack
            customTechStacks={customTechStacks}
            newCustomTechName={newCustomTechName}
            newCustomTechIcon={newCustomTechIcon}
            onNameChange={setNewCustomTechName}
            onIconChange={setNewCustomTechIcon}
            onAdd={addCustomTech}
            onRemove={removeCustomTech}
            selectedSkillCount={selectedSkillIds.length}
          />

          {/* Buttons */}
          <div className="mt-8 pt-6 border-t-4 border-black border-dashed flex flex-col gap-3">
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
              className="relative w-full py-4 bg-black text-white hover:text-black hover:bg-gray-100 border-2 border-black font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-800 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase italic overflow-hidden"
            >
              {isLoading && uploadProgress > 0 && uploadProgress < 100 && (
                <div
                  className="absolute left-0 top-0 bottom-0 bg-blue-600/30 transition-all duration-300 ease-out z-0"
                  style={{ width: `${uploadProgress}%` }}
                />
              )}
              
              <div className="relative z-10 flex items-center gap-3">
                {isLoading ? (
                  <>
                    <Icon icon="svg-spinners:3-dots-fade" className="text-2xl" />
                    <span>
                      {uploadProgress > 0 && uploadProgress < 100
                        ? `Uploading Media... ${uploadProgress}%`
                        : uploadProgress === 100
                        ? "Processing..."
                        : isEditMode
                        ? "Updating..."
                        : "Uploading..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>{isEditMode ? "Update Project" : "Launch Project"}</span>
                    <Icon icon="lucide:rocket" />
                  </>
                )}
              </div>
            </button>

            <Link
              href="/admin/projects"
              className="w-full py-3 bg-white text-black border-2 border-black font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      <ProjectLivePreview
        isOpen={isPreviewOpen}
        project={getPreviewProjectData()}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
