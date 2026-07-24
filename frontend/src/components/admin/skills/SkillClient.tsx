"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import { ReactSortable } from "react-sortablejs";
import { getSkills, addSkill, deleteSkill, updateSkill, bulkDeleteSkills, reorderSkills, updateSkillCategory, deleteSkillCategory } from "@/lib/api/skill";
import { getProfile, saveProfile } from "@/lib/api/profile";
import { alertSuccess, alertError, alertConfirm, alertPrompt } from "@/lib/alert";

const categorizedTech = {
  "Languages & Frontend": [
    { name: "JavaScript", id: "simple-icons:javascript" },
    { name: "TypeScript", id: "simple-icons:typescript" },
    { name: "HTML5", id: "simple-icons:html5" },
    { name: "CSS3", id: "simple-icons:css3" },
    { name: "Vue.js", id: "simple-icons:vuedotjs" },
    { name: "React", id: "simple-icons:react" },
    { name: "Next.js", id: "simple-icons:nextdotjs" },
    { name: "Tailwind CSS", id: "simple-icons:tailwindcss" },
    { name: "Bootstrap", id: "simple-icons:bootstrap" },
    { name: "Sass", id: "simple-icons:sass" },
    { name: "Redux", id: "simple-icons:redux" },
  ],
  "Backend & Database": [
    { name: "PHP", id: "simple-icons:php" },
    { name: "Laravel", id: "simple-icons:laravel" },
    { name: "Node.js", id: "simple-icons:nodedotjs" },
    { name: "Express", id: "simple-icons:express" },
    { name: "Python", id: "simple-icons:python" },
    { name: "MySQL", id: "simple-icons:mysql" },
    { name: "PostgreSQL", id: "simple-icons:postgresql" },
    { name: "MongoDB", id: "simple-icons:mongodb" },
    { name: "Prisma", id: "simple-icons:prisma" },
  ],
  "Tools & DevOps": [
    { name: "Git", id: "simple-icons:git" },
    { name: "GitHub", id: "simple-icons:github" },
    { name: "Docker", id: "simple-icons:docker" },
    { name: "Figma", id: "simple-icons:figma" },
    { name: "Postman", id: "simple-icons:postman" },
    { name: "Linux", id: "simple-icons:linux" },
    { name: "Nginx", id: "simple-icons:nginx" },
    { name: "Apache", id: "simple-icons:apache" },
    { name: "npm", id: "simple-icons:npm" },
    { name: "pnpm", id: "simple-icons:pnpm" },
    { name: "Yarn", id: "simple-icons:yarn" },
  ],
};

const notesList = ["Main Stack", "Familiar", "Learning"];

export default function SkillClient() {
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const formTopRef = useRef<HTMLDivElement>(null);
  const dropdownSuggestionRef = useRef<HTMLDivElement>(null);

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [form, setForm] = useState({
    name: "",
    identifier: "",
    category: "Frontend",
    is_active_on_home: true,
    note: "",
  });

  const [profileData, setProfileData] = useState<any>(null);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<string>("");
  const [categoryTooltips, setCategoryTooltips] = useState<Record<string, string>>({});
  const [customOrderedCategories, setCustomOrderedCategories] = useState<any[]>([]);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Grouped skills mapping
  const [groupedSkills, setGroupedSkills] = useState<Record<string, any[]>>({});
  const groupedSkillsRef = useRef(groupedSkills);
  useEffect(() => {
    groupedSkillsRef.current = groupedSkills;
  }, [groupedSkills]);

  const formCategories = useMemo(() => {
    const cats = new Set(["Frontend", "Backend", "Cloud & DevOps", "Mobile", "Databases"]);
    skills.forEach(s => {
      if (s.category && s.category !== 'Uncategorized') cats.add(s.category);
    });
    return Array.from(cats);
  }, [skills]);

  const activeCategories = useMemo(() => {
    const cats = new Set<string>();
    skills.forEach(s => {
      if (s.category && s.category !== 'Uncategorized') cats.add(s.category);
    });
    return Array.from(cats);
  }, [skills]);

  const filteredSuggestions = useMemo(() => {
    if (!form.name) return [];
    const allTechs = Object.values(categorizedTech).flat();
    return allTechs.filter((tech) => tech.name.toLowerCase().includes(form.name.toLowerCase()));
  }, [form.name]);

  const fetchProfileData = async () => {
    try {
      const res = await getProfile();
      const data = res?.about;
      setProfileData(data);
      setHiddenCategories(data?.hidden_skill_categories || []);
      setDefaultCategory(data?.default_skill_category || "");
      setCategoryTooltips(data?.skill_categories_info || {});
      
      const savedOrder = data?.skill_categories_order || [];
      const currentActive = new Set<string>();
      
      // Need active categories dynamically based on skills at this moment
      // since useMemo might be slightly delayed
      
      const allActive = Array.from(currentActive);
      // Wait, we need the latest activeCategories. We will sync this in a useEffect
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSkillsData = async () => {
    setIsLoading(true);
    try {
      const result = await getSkills();
      setSkills(result || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillsData();
    fetchProfileData();
  }, []);

  // Sync grouped skills whenever skills change or custom order changes
  useEffect(() => {
    const groups: Record<string, any[]> = {};
    skills.forEach((skill) => {
      const cat = skill.category || "Frontend";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ ...skill, id: skill.id.toString() }); // react-sortablejs needs string id sometimes, but we can pass id as is
    });

    const sortedGroups: Record<string, any[]> = {};
    formCategories.forEach(cat => {
      if (groups[cat]) sortedGroups[cat] = groups[cat];
    });
    Object.keys(groups).forEach(cat => {
      if (!sortedGroups[cat]) sortedGroups[cat] = groups[cat];
    });

    setGroupedSkills(sortedGroups);
    
    // Also sync customOrderedCategories for Category Manager
    setCustomOrderedCategories(prev => {
      const allActive = Array.from(new Set(skills.map(s => s.category).filter(c => c && c !== 'Uncategorized')));
      const ordered = (profileData?.skill_categories_order || []).filter((cat: string) => allActive.includes(cat));
      const newCats = allActive.filter(cat => !ordered.includes(cat));
      return [...ordered, ...newCats].map(cat => ({ id: cat, name: cat }));
    });
  }, [skills, formCategories, profileData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownSuggestionRef.current && !dropdownSuggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectTech = (tech: any) => {
    setForm(prev => ({ ...prev, name: tech.name, identifier: tech.id }));
    setShowSuggestions(false);
  };

  const startEdit = (skill: any) => {
    setIsEditing(true);
    setEditId(skill.id);
    setForm({
      name: skill.name,
      identifier: skill.identifier,
      category: skill.category || "Frontend",
      is_active_on_home: skill.is_active_on_home ?? true,
      note: skill.note || "",
    });

    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({
      name: "",
      identifier: "",
      category: "Frontend",
      is_active_on_home: true,
      note: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.identifier) {
      alertError("Nama Skill dan Icon tidak boleh kosong!");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token") || "";
      let response;
      if (isEditing) {
        response = await updateSkill(token, editId!, form);
      } else {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("identifier", form.identifier);
        formData.append("category", form.category);
        formData.append("is_active_on_home", form.is_active_on_home ? "1" : "0");
        formData.append("note", form.note);
        response = await addSkill(token, formData);
      }

      if (response.ok) {
        await alertSuccess(isEditing ? "Skill berhasil diupdate!" : "Skill berhasil ditambahkan!");
        cancelEdit();
        fetchSkillsData();
      } else {
        const err = await response.json();
        alertError(err.message || "Gagal menyimpan skill");
      }
    } catch (e) {
      console.error(e);
      alertError("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDragEnd = () => {
    setTimeout(async () => {
      const orderedIds = Object.values(groupedSkillsRef.current).flat().map(skill => skill.id);
      try {
        const token = localStorage.getItem("token") || "";
        await reorderSkills(token, orderedIds);
      } catch (error) {
        console.error("Failed to save new order", error);
        alertError("Failed to save new order");
      }
    }, 100);
  };

  const handleDelete = async (id: number) => {
    const confirm = await alertConfirm("Yakin ingin menghapus skill ini?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token") || "";
      const response = await deleteSkill(token, id);
      const responseBody = await response.json();
      if (response.status === 200) {
        await alertSuccess("Skill dihapus!");
        await fetchSkillsData();
        setSelectedIds(prev => prev.filter(sId => sId !== id));
      } else {
        await alertError(responseBody.message);
      }
    } catch (e) {
      alertError("Gagal menghapus");
    }
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    if (isSelectMode) setSelectedIds([]);
  };

  const toggleSelection = (id: number) => {
    if (!isSelectMode) return;
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === skills.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(skills.map(skill => skill.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirm = await alertConfirm(`Yakin ingin menghapus ${selectedIds.length} skill yang dipilih?`);
    if (!confirm) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await bulkDeleteSkills(token, selectedIds);
      const responseBody = await response.json();
      if (response.status === 200) {
        await alertSuccess(responseBody.message || "Skills berhasil dihapus!");
        await fetchSkillsData();
        setIsSelectMode(false);
        setSelectedIds([]);
      } else {
        await alertError(responseBody.message || "Gagal menghapus skills");
      }
    } catch (e) {
      alertError("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setHiddenCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const saveCategoryVisibility = async () => {
    if (!profileData) return;
    setIsSavingCategory(true);
    
    const formData = new FormData();
    formData.append("name", profileData.name || "");
    formData.append("job_title", profileData.job_title || "");
    formData.append("about_description", profileData.about_description || "");
    formData.append("default_skill_category", defaultCategory || "");
    
    if (hiddenCategories.length === 0) {
      formData.append("hidden_skill_categories[]", "");
    } else {
      hiddenCategories.forEach((cat) => {
        formData.append("hidden_skill_categories[]", cat);
      });
    }

    if (customOrderedCategories.length === 0) {
      formData.append("skill_categories_order[]", "");
    } else {
      customOrderedCategories.forEach((catObj) => {
        formData.append("skill_categories_order[]", catObj.name);
      });
    }

    if (Object.keys(categoryTooltips).length === 0) {
      formData.append("skill_categories_info[]", "");
    } else {
      Object.entries(categoryTooltips).forEach(([cat, tooltip]) => {
        formData.append(`skill_categories_info[${cat}]`, tooltip);
      });
    }

    try {
      const token = localStorage.getItem("token") || "";
      const res = await saveProfile(token, formData);
      if (res.ok) {
        await alertSuccess("Category visibility saved!");
        setIsCategoryManagerOpen(false);
        fetchProfileData();
      } else {
        await alertError("Failed to save categories");
      }
    } catch (e) {
      console.error(e);
      alertError("Terjadi kesalahan");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const editCategoryName = async (oldCatName: string) => {
    const newName = await alertPrompt(`Edit nama kategori '${oldCatName}'`, oldCatName);
    if (!newName || newName.trim() === "" || newName === oldCatName) return;

    try {
      const token = localStorage.getItem("token") || "";
      const res = await updateSkillCategory(token, oldCatName, newName);
      const data = await res.json();
      if (res.ok) {
        await alertSuccess(data.message || "Kategori berhasil diubah");
        await fetchSkillsData();
        await fetchProfileData();
      } else {
        await alertError(data.message || "Gagal mengubah kategori");
      }
    } catch (e) {
      console.error(e);
      alertError("Terjadi kesalahan sistem");
    }
  };

  const editCategoryTooltip = async (catName: string) => {
    const currentTooltip = categoryTooltips[catName] || "";
    const newTooltip = await alertPrompt(`Edit tooltip untuk kategori "${catName}":`, currentTooltip);
    
    if (newTooltip !== null && newTooltip !== undefined) {
      setCategoryTooltips(prev => ({ ...prev, [catName]: newTooltip.trim() }));
    }
  };

  const handleDeleteCategory = async (catName: string) => {
    const confirm = await alertConfirm(`Yakin ingin menghapus kategori '${catName}'? Semua skill di dalamnya akan dipindahkan ke kategori 'Uncategorized'.`);
    if (!confirm) return;
    
    try {
      const token = localStorage.getItem("token") || "";
      const res = await deleteSkillCategory(token, catName);
      const data = await res.json();
      if (res.ok) {
        await alertSuccess(data.message || "Kategori berhasil dihapus");
        await fetchSkillsData();
        await fetchProfileData();
      } else {
        await alertError(data.message || "Gagal menghapus kategori");
      }
    } catch (e) {
      console.error(e);
      alertError("Terjadi kesalahan sistem");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10 border-b-4 border-black pb-4 flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase">SKILL MANAGER</h1>
          <p className="font-mono text-gray-600 mt-2 text-sm md:text-base">Manage your tech stack efficiently.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {isSelectMode && (
            <button
              onClick={toggleSelectAll}
              className="border-2 border-black px-3 py-1 font-mono font-bold text-xs md:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-black hover:bg-black hover:text-white transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              {selectedIds.length === skills.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
          {skills.length > 0 && (
            <button
              onClick={toggleSelectMode}
              className={`border-2 border-black px-3 py-1 font-mono font-bold text-xs md:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                isSelectMode ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              {isSelectMode ? 'Cancel' : 'Select Mode'}
            </button>
          )}
          <button
            onClick={() => setIsCategoryManagerOpen(true)}
            className="bg-blue-100 text-blue-900 px-3 py-1 font-mono font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-200 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Category Manager
          </button>
          <div className="hidden md:block bg-black text-white px-3 py-1 font-mono font-bold border-2 border-black">
            {skills.length} SKILLS
          </div>
        </div>
      </div>

      <div
        ref={formTopRef}
        className={`border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12 transition-colors scroll-mt-24 ${isEditing ? 'bg-gray-50' : 'bg-white'}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="font-black text-xl md:text-2xl flex items-center gap-2 uppercase">
            <Icon icon={isEditing ? 'lucide:edit' : 'lucide:plus-circle'} />
            {isEditing ? "EDIT SKILL" : "ADD NEW SKILL"}
          </h2>

          <button
            type="button"
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            className="flex items-center gap-2 text-xs font-black uppercase border-2 border-black px-3 py-1 bg-white hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            <Icon icon={isLibraryOpen ? 'lucide:chevron-up' : 'lucide:layout-grid'} />
            {isLibraryOpen ? "Hide Library" : "Browse Tech Library"}
          </button>
        </div>

        <div className={`transition-all duration-300 overflow-hidden ${isLibraryOpen ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0'}`}>
          <div className="mb-8 border-2 border-black bg-gray-50 p-4 font-mono">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-lg underline decoration-black decoration-4 uppercase">Tech Library</h3>
              <p className="hidden sm:block text-[10px] font-mono bg-black text-white px-2 py-1 uppercase">
                Click icon to auto-fill
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(categorizedTech).map(([category, techs]) => (
                <div key={category}>
                  <h4 className="font-black text-[10px] uppercase mb-3 text-gray-500 border-b border-gray-300 pb-1">
                    {category}
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {techs.map((tech) => (
                      <button
                        key={tech.id}
                        type="button"
                        onClick={() => selectTech(tech)}
                        className="group flex flex-col items-center p-2 border-2 border-transparent hover:border-black hover:bg-white transition-all"
                        title={tech.name}
                      >
                        <Icon icon={tech.id} className="text-2xl group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-bold mt-1 truncate w-full text-center">{tech.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:flex-1 relative" ref={dropdownSuggestionRef}>
            <label className="block font-bold mb-2 border-b-2 border-black inline-block uppercase">TECH NAME <span className="text-red-500">*</span></label>
            <input
              value={form.name}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setShowSuggestions(true);
              }}
              type="text"
              placeholder="Ketik nama (misal: React)"
              className="w-full p-4 border-2 border-black font-mono focus:bg-gray-100 focus:outline-none transition-colors"
              autoComplete="off"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border-2 border-t-0 border-black shadow-lg max-h-48 overflow-y-auto">
                {filteredSuggestions.map((tech) => (
                  <div
                    key={tech.id}
                    onClick={() => selectTech(tech)}
                    className="p-3 hover:bg-black hover:text-white cursor-pointer flex items-center gap-3 border-b border-gray-200"
                  >
                    <Icon icon={tech.id} className="text-xl" />
                    <span className="font-bold">{tech.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:flex-1">
            <label className="block font-bold mb-2 border-b-2 border-black inline-block uppercase">ICON CODE (AUTO) <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-2">
              <input
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                type="text"
                placeholder="simple-icons:..."
                className="w-full p-4 border-2 border-black font-mono bg-gray-100 focus:bg-white focus:outline-none"
              />
              <div className="w-14 h-14 border-2 border-black flex items-center justify-center bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                {form.identifier ? (
                  <Icon icon={form.identifier} className="text-3xl" />
                ) : (
                  <span className="text-xs text-gray-400">N/A</span>
                )}
              </div>
            </div>
            <p className="text-xs mt-1 text-gray-500 font-mono">
              *Code otomatis terisi jika memilih dari saran. Atau cari manual di{" "}
              <a href="https://icones.js.org/" target="_blank" rel="noreferrer" className="font-bold text-black underline">Icones</a>.
            </p>
          </div>

          <div className="w-full md:flex-[0.8]">
            <label className="block font-bold mb-2 border-b-2 border-black inline-block uppercase">CATEGORY <span className="text-red-500">*</span></label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              list="categories-list"
              className="w-full p-4 border-2 border-black font-mono focus:bg-gray-100 focus:outline-none transition-colors bg-white rounded-none"
              placeholder="Pilih/ketik kategori"
            />
            <datalist id="categories-list">
              {formCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </datalist>

            <label className="block font-bold mt-4 mb-2 border-b-2 border-black inline-block uppercase">PROFICIENCY/NOTE (Max 20)</label>
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              list="notes-list"
              maxLength={20}
              className="w-full p-4 border-2 border-black font-mono focus:bg-gray-100 focus:outline-none transition-colors bg-white rounded-none"
              placeholder="e.g. Main Stack"
            />
            <datalist id="notes-list">
              {notesList.map(note => (
                <option key={note} value={note}>{note}</option>
              ))}
            </datalist>
            
            <div className="mt-4 flex items-center gap-2 border-2 border-black p-3 bg-yellow-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <input
                type="checkbox"
                id="isActiveOnHome"
                checked={form.is_active_on_home}
                onChange={(e) => setForm({ ...form, is_active_on_home: e.target.checked })}
                className="w-5 h-5 accent-black cursor-pointer"
              />
              <label htmlFor="isActiveOnHome" className="font-bold cursor-pointer font-mono select-none">Show on Home Page</label>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2 md:mt-8 w-full md:w-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`h-[58px] font-black px-8 border-2 border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,0)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 uppercase ${isEditing ? 'bg-white text-black border-black hover:bg-gray-500' : 'bg-black text-white hover:bg-white hover:text-black hover:border-black'}`}
            >
              {isSubmitting ? "SAVING..." : isEditing ? "UPDATE SKILL" : "SAVE SKILL"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-xs font-bold text-black underline hover:text-gray-500 text-center uppercase"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h2 className="font-black text-2xl mb-6 uppercase flex items-center gap-3">
          <Icon icon="lucide:zap" />
          Skills
        </h2>

        {isLoading ? (
          <div className="text-center font-mono py-10">Loading Data...</div>
        ) : skills.length === 0 ? (
          <div className="text-center py-12 border-4 border-black bg-gray-50 flex flex-col items-center gap-4">
            <Icon icon="lucide:ghost" className="text-6xl text-gray-300" />
            <div>
              <h3 className="font-black text-xl uppercase">Nothing here yet</h3>
              <p className="font-mono text-sm text-gray-500">Start adding your first skill above!</p>
            </div>
          </div>
        ) : (
          <div>
            {Object.entries(groupedSkills).map(([categoryName, items]) => (
              <div key={categoryName} className="mb-12">
                <h3 className="font-black text-xl mb-4 uppercase border-b-4 border-black pb-1 inline-block">{categoryName}</h3>
                
                <ReactSortable
                  list={items}
                  setList={(newState) => {
                    setGroupedSkills(prev => ({
                      ...prev,
                      [categoryName]: newState
                    }));
                  }}
                  group="skills"
                  animation={200}
                  onEnd={onDragEnd}
                  className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
                >
                  {items.map(skill => (
                    <div
                      key={skill.id}
                      onClick={() => toggleSelection(Number(skill.id))}
                      className={`group relative bg-white border-2 border-black flex flex-col items-center hover:-translate-y-1 transition-all duration-200 ${isSelectMode ? 'cursor-pointer' : ''} ${selectedIds.includes(Number(skill.id)) ? 'bg-gray-100 shadow-none translate-y-1' : 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}
                    >
                      {isSelectMode && (
                        <div className="absolute top-2 left-2 z-10">
                          <div className={`w-6 h-6 border-2 border-black flex items-center justify-center transition-colors ${selectedIds.includes(Number(skill.id)) ? 'bg-black text-white' : 'bg-white text-transparent'}`}>
                            <Icon icon="lucide:check" width="16" strokeWidth="4" />
                          </div>
                        </div>
                      )}
                      
                      {!skill.is_active_on_home && (
                        <div className="absolute top-2 right-2 text-red-500" title="Hidden on Home">
                          <Icon icon="lucide:eye-off" width="20" strokeWidth="2.5" />
                        </div>
                      )}
                      
                      {skill.note && (
                        <div className="absolute -top-3 -right-3 z-20">
                          <span className="bg-black text-white text-[10px] font-black px-2 py-1 uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                            {skill.note}
                          </span>
                        </div>
                      )}
                      
                      <div className="p-4 flex flex-col items-center gap-4 w-full">
                        <div className="w-16 h-16 flex items-center justify-center">
                          <Icon icon={skill.identifier} className="text-5xl" />
                        </div>
                        <div className="text-center w-full pt-2">
                          <h3 className="font-black font-mono text-sm truncate">{skill.name}</h3>
                        </div>
                      </div>

                      {!isSelectMode && (
                        <div className="hidden md:flex absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2 backdrop-blur-[1px]">
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(skill); }}
                            className="bg-white text-black border-2 border-black p-2 hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            title="Edit"
                          >
                            <Icon icon="lucide:edit-2" width="20" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(skill.id); }}
                            className="bg-red-500 text-white hover:bg-red-600 border-2 border-black p-2 hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            title="Hapus"
                          >
                            <Icon icon="lucide:trash-2" width="20" />
                          </button>
                        </div>
                      )}

                      {!isSelectMode && (
                        <div className="flex md:hidden w-full border-t-2 border-black">
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(skill); }}
                            className="flex-1 bg-gray-200 py-3 flex items-center justify-center border-r-2 border-black active:bg-gray-500"
                          >
                            <Icon icon="lucide:edit-2" width="16" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(skill.id); }}
                            className="bg-red-500 text-white hover:bg-red-600 flex-1 py-3 flex items-center justify-center active:bg-red-700"
                          >
                            <Icon icon="lucide:trash-2" width="16" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </ReactSortable>
              </div>
            ))}
          </div>
        )}
      </div>

      {isSelectMode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 transform transition-transform duration-300 translate-y-0 flex justify-center">
          <div className="bg-black text-white border-2 border-white shadow-[0_-4px_20px_rgba(0,0,0,0.5)] rounded-2xl flex items-center justify-between p-4 max-w-lg w-full">
            <div className="font-bold font-mono">
              {selectedIds.length} Selected
            </div>
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0 || isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white font-black px-4 py-2 border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center gap-2 uppercase"
            >
              <Icon icon="lucide:trash-2" />
              Delete
            </button>
          </div>
        </div>
      )}

      {isCategoryManagerOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black p-6 md:p-8 max-w-xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex flex-col max-h-[90vh]">
            <button onClick={() => setIsCategoryManagerOpen(false)} className="absolute top-4 right-4 hover:scale-110 transition-transform">
              <Icon icon="lucide:x" width="24" strokeWidth="3" />
            </button>
            <h2 className="font-black text-2xl mb-2 uppercase">Category Manager</h2>
            <p className="font-mono text-sm text-gray-600 mb-6 border-b-2 border-black pb-4">
              Pilih kategori yang ingin <strong>disembunyikan</strong> dari tab Home Page. Skill di dalamnya akan tetap muncul secara independen.
            </p>
            
            <div className="flex-1 overflow-y-auto pr-2 mb-6">
              <ReactSortable
                list={customOrderedCategories}
                setList={setCustomOrderedCategories}
                handle=".drag-handle"
                animation={200}
                className="flex flex-col gap-3"
              >
                {customOrderedCategories.map((catObj) => (
                  <div key={catObj.id} className="flex items-center justify-between border-2 border-black p-3 hover:bg-gray-50 transition-colors bg-white">
                    <div className="flex items-center gap-3">
                      <div className="drag-handle cursor-grab active:cursor-grabbing text-gray-400 hover:text-black transition-colors" title="Drag to reorder">
                        <Icon icon="lucide:grip-vertical" width="16" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold font-mono leading-tight">{catObj.name}</span>
                        {categoryTooltips[catObj.name] && (
                          <span className="text-[10px] text-gray-500 font-mono leading-tight max-w-[150px] truncate" title={categoryTooltips[catObj.name]}>
                            {categoryTooltips[catObj.name]}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => editCategoryName(catObj.name)} 
                        className="text-gray-500 hover:text-black hover:scale-110 transition-all"
                        title="Edit Kategori"
                      >
                        <Icon icon="lucide:edit" width="16" />
                      </button>
                      <button 
                        onClick={() => editCategoryTooltip(catObj.name)} 
                        className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-all"
                        title="Edit Tooltip Kategori"
                      >
                        <Icon icon="lucide:info" width="16" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(catObj.name)} 
                        className="text-red-500 hover:text-red-700 hover:scale-110 transition-all"
                        title="Hapus Kategori"
                      >
                        <Icon icon="lucide:trash-2" width="16" />
                      </button>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className={`text-xs uppercase font-black ${hiddenCategories.includes(catObj.name) ? 'text-red-500' : 'text-green-600'}`}>
                        {hiddenCategories.includes(catObj.name) ? 'Hidden' : 'Visible'}
                      </span>
                      <div className={`w-6 h-6 border-2 border-black flex items-center justify-center ${hiddenCategories.includes(catObj.name) ? 'bg-black text-white' : 'bg-white text-transparent'}`}>
                        <Icon icon="lucide:eye-off" width="16" />
                      </div>
                      <input type="checkbox" checked={hiddenCategories.includes(catObj.name)} onChange={() => toggleCategory(catObj.name)} className="hidden" />
                    </label>
                  </div>
                ))}
              </ReactSortable>
            </div>
            
            <div className="mb-6 shrink-0">
              <label className="block font-bold font-mono text-sm mb-2 uppercase">Default Active Kategori (Home)</label>
              <select 
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value)}
                className="w-full p-3 border-2 border-black font-mono focus:bg-gray-100 focus:outline-none transition-colors cursor-pointer bg-white"
              >
                <option value="">-- Pilih "All" --</option>
                {activeCategories.map(cat => (
                  <option key={`def-${cat}`} value={cat} disabled={hiddenCategories.includes(cat)}>
                    {cat} {hiddenCategories.includes(cat) ? '(Hidden)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={saveCategoryVisibility}
              disabled={isSavingCategory}
              className="w-full py-4 bg-black text-white hover:bg-gray-800 border-2 border-black font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {isSavingCategory ? (
                <>
                  <Icon icon="svg-spinners:3-dots-fade" className="text-xl" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon icon="lucide:save" className="text-xl" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
