"use client";

import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { marked } from "marked";
import { getToken } from "@/utils/auth";
import { Experience } from "@/types";
import {
  getAllExperiences,
  createExperience,
  updateExperience,
  adminDeleteExperience,
} from "@/lib/api/experience";
import { alertSuccess, alertError, alertConfirmExperience } from "@/lib/alert";

interface ExperienceClientProps {
  initialExperiences: Experience[];
}

export default function ExperienceClient({ initialExperiences }: ExperienceClientProps) {
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | number | null>(null);

  const formTopRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    company_name: "",
    role: "",
    status: "Full-time",
    location: "",
    start_date: "",
    end_date: "",
    description: "",
    is_current: false,
    is_active: true,
  });

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusOptions = ["Full-time", "Part-time", "Freelance", "Internship", "Contract", "Education"];

  const renderMarkdown = (text: string) => {
    if (!text) return { __html: "" };
    // marked.parse returns a string or Promise depending on config, but default is string.
    return { __html: marked.parse(text, { breaks: true }) as string };
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await getAllExperiences();
      const sorted = result.sort(
        (a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime()
      );
      setExperiences(sorted);
    } catch (error) {
      console.error(error);
      alertError("Gagal mengambil data experience");
    } finally {
      setIsLoading(false);
    }
  };

  // Sort initially
  useEffect(() => {
    const sorted = [...initialExperiences].sort(
      (a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime()
    );
    setExperiences(sorted);
  }, [initialExperiences]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleCurrentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setForm((prev) => ({
      ...prev,
      is_current: checked,
      end_date: checked ? "" : prev.end_date,
    }));
  };

  const resetForm = () => {
    setForm({
      company_name: "",
      role: "",
      status: "Full-time",
      location: "",
      start_date: "",
      end_date: "",
      description: "",
      is_current: false,
      is_active: true,
    });
    setIsEditing(false);
    setEditId(null);
    setIsStatusDropdownOpen(false);
  };

  const startEdit = (item: Experience) => {
    setIsEditing(true);
    setEditId(item.id);

    setForm({
      company_name: item.company_name || "",
      role: item.role || "",
      status: item.status || "Full-time",
      location: item.location || "",
      start_date: item.start_date ? item.start_date.substring(0, 10) : "",
      end_date: item.end_date ? item.end_date.substring(0, 10) : "",
      description: item.description || "",
      is_current: !item.end_date,
      is_active: item.is_active ?? true,
    });

    setTimeout(() => {
      if (formTopRef.current) {
        formTopRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const selectStatus = (value: string) => {
    setForm((prev) => ({ ...prev, status: value }));
    setIsStatusDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.role || !form.start_date) {
      alertError("Nama Perusahaan, Role, dan Tanggal Mulai wajib diisi!");
      return;
    }

    const token = getToken();
    if (!token) {
      alertError("Anda belum login!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        company_name: form.company_name,
        role: form.role,
        status: form.status,
        location: form.location,
        start_date: form.start_date,
        end_date: form.is_current ? null : form.end_date,
        description: form.description,
        is_active: form.is_active,
      };

      let response;
      if (isEditing && editId) {
        response = await updateExperience(token, editId, payload);
      } else {
        response = await createExperience(token, payload);
      }

      const responseBody = await response.json();

      if (response.ok) {
        await alertSuccess(isEditing ? "Experience Updated! 🚀" : "Experience Added! 🎉");
        resetForm();
        fetchData();
      } else {
        alertError(responseBody.message || "Gagal menyimpan data.");
      }
    } catch (error) {
      console.error(error);
      alertError("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    const confirmed = await alertConfirmExperience("Yakin ingin menghapus history ini?");
    if (!confirmed) return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await adminDeleteExperience(token, id);
      if (response.ok) {
        alertSuccess("Experience deleted! 🗑️");
        fetchData();
      } else {
        alertError("Gagal menghapus data.");
      }
    } catch (e) {
      console.error(e);
      alertError("Terjadi kesalahan sistem.");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "PRESENT";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric" }).format(date).toUpperCase();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10 border-b-4 border-black pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase">EXPERIENCE MANAGER</h1>
          <p className="font-mono text-gray-600 mt-2 text-sm md:text-base">
            Track your professional journey & career path.
          </p>
        </div>
        <div className="hidden md:block bg-black text-white px-3 py-1 font-mono font-bold">
          {experiences.length} EXPERIENCES
        </div>
      </div>

      <div
        ref={formTopRef}
        className={`border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-16 transition-colors scroll-mt-24 relative ${
          isEditing ? "bg-gray-50" : "bg-white"
        }`}
      >
        {isEditing && (
          <div className="absolute -top-4 -right-2 bg-white border-2 border-black px-3 py-1 font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-3">
            EDIT MODE ON
          </div>
        )}

        <h2 className="font-black text-lg md:text-2xl mb-6 flex items-center gap-2">
          <Icon icon={isEditing ? "lucide:edit-3" : "lucide:plus-square"} />
          {isEditing ? "EDIT EXPERIENCE" : "ADD NEW EXPERIENCE"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold mb-2 text-sm uppercase">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                type="text"
                placeholder="e.g. Stark Industries"
                className="w-full p-3 border-2 border-black font-mono focus:bg-gray-50 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block font-bold mb-2 text-sm uppercase">
                Role / Job Title <span className="text-red-500">*</span>
              </label>
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                type="text"
                placeholder="e.g. Lead Engineer"
                className="w-full p-3 border-2 border-black font-mono focus:bg-gray-50 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative" ref={dropdownRef}>
              <label className="block font-bold mb-2 text-sm uppercase">
                Employment Type <span className="text-red-500">*</span>
              </label>
              <div className="relative z-20">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  }}
                  className={`w-full font-mono bg-white flex justify-between items-center focus:outline-none transition-all text-left border-2 border-black px-3 ${
                    isStatusDropdownOpen
                      ? "border-b-0 pb-[14px] pt-3 shadow-none"
                      : "py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  }`}
                >
                  <span className="truncate">{form.status}</span>
                  <Icon
                    icon="lucide:chevron-down"
                    className={`transition-transform duration-200 ${isStatusDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 w-full bg-white border-2 border-t-0 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto">
                    {statusOptions.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => selectStatus(opt)}
                        className={`p-3 border-b-2 border-black last:border-b-0 cursor-pointer font-mono text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-between group ${
                          form.status === opt ? "bg-gray-200" : ""
                        }`}
                      >
                        <span>{opt}</span>
                        {form.status === opt && (
                          <Icon icon="lucide:check" className="group-hover:text-black text-black" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2 text-sm uppercase">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                type="text"
                placeholder="e.g. Jakarta, ID (Remote)"
                className="w-full p-3 border-2 border-black font-mono focus:bg-gray-50 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <label className="block font-bold mb-2 text-sm uppercase">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                type="date"
                className="w-full p-3 border-2 border-black font-mono focus:bg-gray-50 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="block font-bold mb-2 text-sm uppercase">End Date</label>
              <input
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                type="date"
                disabled={form.is_current}
                className={`w-full p-3 border-2 border-black font-mono focus:outline-none transition-all ${
                  form.is_current
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "focus:bg-gray-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                }`}
              />

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="currentJob"
                  checked={form.is_current}
                  onChange={handleCurrentChange}
                  className="w-5 h-5 border-2 border-black accent-black focus:ring-0 cursor-pointer"
                />
                <label htmlFor="currentJob" className="font-bold text-sm uppercase cursor-pointer select-none">
                  {form.status === "Education" ? "I am currently studying here" : "I currently work here"}
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2 text-sm uppercase flex justify-between">
              <span>
                Description / Achievements (Markdown Supported) <span className="text-red-500">*</span>
              </span>
              <span className="text-[10px] text-gray-400 capitalize font-mono">use **bold**, *italic*, or - bullets</span>
            </label>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={8}
                placeholder="- **Developed** cool stuff using React&#10;- *Improved* performance by 20%"
                className="w-full p-3 border-2 border-black font-mono focus:bg-gray-50 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all resize-y"
              ></textarea>

              <div className="border-2 border-black border-dashed p-3 bg-gray-50 overflow-y-auto max-h-[250px] custom-scrollbar">
                <div className="text-[10px] font-black uppercase text-gray-400 mb-2">Live Preview:</div>
                <div
                  dangerouslySetInnerHTML={renderMarkdown(form.description)}
                  className="markdown-preview font-mono text-sm prose prose-sm max-w-none"
                ></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-max">
            <input
              type="checkbox"
              id="isActive"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-6 h-6 border-2 border-black accent-black focus:ring-0 cursor-pointer"
            />
            <label htmlFor="isActive" className="font-black uppercase cursor-pointer select-none">
              Show on Public Homepage
            </label>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4 border-t-2 border-black border-dashed">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 uppercase flex justify-center items-center gap-2 ${
                isEditing ? "bg-white hover:bg-gray-200" : "bg-black text-white hover:text-black hover:bg-gray-100"
              }`}
            >
              <Icon icon={isSubmitting ? "svg-spinners:3-dots-fade" : isEditing ? "lucide:save" : "lucide:plus-circle"} />
              {isSubmitting ? "SAVING..." : isEditing ? "UPDATE EXPERIENCE" : "SAVE EXPERIENCE"}
            </button>

            {isEditing && (
              <button
                onClick={resetForm}
                type="button"
                className="md:w-auto w-full py-3 px-8 font-bold border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-50 hover:text-gray-500 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all uppercase"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h2 className="font-black text-2xl mb-6 uppercase flex items-center gap-3">
          <Icon icon="lucide:history" />
          Experience History
        </h2>

        {isLoading ? (
          <div className="p-12 text-center border-4 border-black border-dashed font-mono animate-pulse bg-white">
            LOADING DATA...
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-12 border-4 border-black bg-gray-50 flex flex-col items-center gap-4">
            <Icon icon="lucide:ghost" className="text-6xl text-gray-300" />
            <div>
              <h3 className="font-black text-xl uppercase">Nothing here yet</h3>
              <p className="font-mono text-sm text-gray-500">Start adding your first job above!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 relative">
            <div className="hidden lg:block absolute left-[150px] top-4 bottom-4 w-1 bg-black border-x border-black bg-opacity-20 z-0"></div>

            {experiences.map((exp) => (
              <div key={exp.id} className="relative z-10 flex flex-col lg:flex-row gap-6 items-stretch group">
                <div className="hidden lg:flex w-[150px] flex-col items-end pt-5 pr-6 flex-shrink-0 text-right">
                  <span className="font-black text-xl leading-none">
                    {formatDate(exp.start_date || null).split(" ")[1]}
                  </span>
                  <span className="font-mono text-sm font-bold text-gray-500">
                    {formatDate(exp.start_date || null).split(" ")[0]}
                  </span>
                  <div className="h-8 w-[2px] bg-black my-2"></div>
                  <span className={`font-black text-lg leading-none ${!exp.end_date ? "text-black" : ""}`}>
                    {exp.end_date ? formatDate(exp.end_date).split(" ")[1] : "NOW"}
                  </span>
                  {exp.end_date && (
                    <span className="font-mono text-sm font-bold text-gray-500">
                      {formatDate(exp.end_date).split(" ")[0]}
                    </span>
                  )}
                </div>

                <div className="hidden lg:block absolute left-[142px] top-6 w-5 h-5 bg-white border-4 border-black rounded-full z-20 group-hover:scale-125 group-hover:bg-white transition-transform"></div>

                <div className="flex-1 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-1 transition-all duration-300">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="bg-black text-white px-2 py-0.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(100,100,100,1)]">
                      {exp.status}
                    </span>
                    {!exp.is_active && (
                      <span className="bg-red-500 text-white px-2 py-0.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(100,100,100,1)] animate-pulse">
                        HIDDEN FROM PUBLIC
                      </span>
                    )}
                    <span className="lg:hidden font-mono text-xs font-bold border-2 border-black px-2 py-0.5 bg-gray-100">
                      {formatDate(exp.start_date || null)} - {formatDate(exp.end_date || null)}
                    </span>
                    {!exp.end_date && (
                      <span className="bg-black text-white hover:text-black hover:bg-gray-100 border-2 border-black px-2 py-0.5 font-black text-[10px] uppercase animate-pulse">
                        {exp.status === "Education" ? "Ongoing / Active" : "Current Job"}
                      </span>
                    )}
                  </div>

                  <div className="border-b-2 border-black border-dashed pb-3 mb-3">
                    <h3 className="text-2xl font-black uppercase italic leading-tight">{exp.role}</h3>
                    <div className="flex items-center gap-2 text-black underline font-bold mt-1">
                      <Icon icon={exp.status === "Education" ? "lucide:graduation-cap" : "lucide:building-2"} />
                      {exp.company_name}
                    </div>

                    {exp.location && (
                      <div className="flex items-center gap-2 text-gray-500 font-bold text-sm mt-1">
                        <Icon icon="lucide:map-pin" className="text-black" />
                        {exp.location}
                      </div>
                    )}
                  </div>

                  <div
                    dangerouslySetInnerHTML={renderMarkdown(exp.description || "")}
                    className="font-mono text-sm text-gray-700 whitespace-pre-line leading-relaxed mb-6 prose prose-sm max-w-none markdown-preview"
                  ></div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => startEdit(exp)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-white hover:scale-105 transition-transform uppercase"
                    >
                      <Icon icon="lucide:pencil" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="bg-red-500 text-white hover:bg-red-600 flex items-center gap-2 px-4 py-2 border-2 border-black font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform uppercase"
                    >
                      <Icon icon="lucide:trash-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
