"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Icon } from "@iconify/react";
import { getProfile, saveProfile } from "@/lib/api/profile";
import { alertSuccess, alertError } from "@/lib/alert";
import { getToken } from "@/utils/auth";

export default function ProfileClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    job_title: "",
    about_description: "",
    is_available_for_work: true,
    show_featured_projects_on_home: true,
    show_featured_certificates_on_home: true,
    show_experiences_on_home: true,
    show_tech_on_home: true,
  });

  const [originalForm, setOriginalForm] = useState({
    name: "",
    job_title: "",
    about_description: "",
    is_available_for_work: true,
    show_featured_projects_on_home: true,
    show_featured_certificates_on_home: true,
    show_experiences_on_home: true,
    show_tech_on_home: true,
  });

  type HeroPhoto = { id: string; file?: File; preview: string; isExisting?: boolean; originalUrl?: string };
  const [heroPhotos, setHeroPhotos] = useState<HeroPhoto[]>([]);
  const [originalHeroPhotos, setOriginalHeroPhotos] = useState<HeroPhoto[]>([]);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [currentCvPath, setCurrentCvPath] = useState<string | null>(null);

  const heroPhotoInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const hasChanges = useMemo(() => {
    const hasNewFiles = cvFile !== null;
    
    // Check if hero photos changed (different length, or different items)
    let heroPhotosChanged = false;
    if (heroPhotos.length !== originalHeroPhotos.length) {
      heroPhotosChanged = true;
    } else {
      for (let i = 0; i < heroPhotos.length; i++) {
        if (heroPhotos[i].id !== originalHeroPhotos[i].id || heroPhotos[i].file) {
          heroPhotosChanged = true;
          break;
        }
      }
    }

    const hasTextChanges =
      form.name !== originalForm.name ||
      form.job_title !== originalForm.job_title ||
      form.about_description !== originalForm.about_description ||
      form.is_available_for_work !== originalForm.is_available_for_work ||
      form.show_featured_projects_on_home !== originalForm.show_featured_projects_on_home ||
      form.show_featured_certificates_on_home !== originalForm.show_featured_certificates_on_home ||
      form.show_experiences_on_home !== originalForm.show_experiences_on_home ||
      form.show_tech_on_home !== originalForm.show_tech_on_home;

    return hasNewFiles || hasTextChanges || heroPhotosChanged;
  }, [form, originalForm, heroPhotos, originalHeroPhotos, cvFile]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await getProfile();
      
      if (result && result.about) {
        setForm({
          name: result.about.name || "",
          job_title: result.about.job_title || "",
          about_description: result.about.about_description || "",
          is_available_for_work: result.about.is_available_for_work ?? true,
          show_featured_projects_on_home: result.about.show_featured_projects_on_home ?? true,
          show_featured_certificates_on_home: result.about.show_featured_certificates_on_home ?? true,
          show_experiences_on_home: result.about.show_experiences_on_home ?? true,
          show_tech_on_home: result.about.show_tech_on_home ?? true,
        });

        setOriginalForm({
          name: result.about.name || "",
          job_title: result.about.job_title || "",
          about_description: result.about.about_description || "",
          is_available_for_work: result.about.is_available_for_work ?? true,
          show_featured_projects_on_home: result.about.show_featured_projects_on_home ?? true,
          show_featured_certificates_on_home: result.about.show_featured_certificates_on_home ?? true,
          show_experiences_on_home: result.about.show_experiences_on_home ?? true,
          show_tech_on_home: result.about.show_tech_on_home ?? true,
        });

        if (result.about.hero_photo_urls && Array.isArray(result.about.hero_photo_urls)) {
          const loadedPhotos = result.about.hero_photo_urls.map((url: string, index: number) => ({
            id: `existing-${index}`,
            preview: url,
            isExisting: true,
            originalUrl: url
          }));
          setHeroPhotos(loadedPhotos);
          setOriginalHeroPhotos(loadedPhotos);
        } else {
          setHeroPhotos([]);
          setOriginalHeroPhotos([]);
        }
        if (result.about.cv_url) setCurrentCvPath(result.about.cv_url);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeroPhotosChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos: HeroPhoto[] = [];
    Array.from(files).forEach((file, index) => {
      if (heroPhotos.length + newPhotos.length < 10) {
        newPhotos.push({
          id: `new-${Date.now()}-${index}`,
          file,
          preview: URL.createObjectURL(file),
        });
      }
    });

    if (newPhotos.length > 0) {
      setHeroPhotos([...heroPhotos, ...newPhotos]);
    }
    
    if (heroPhotoInputRef.current) heroPhotoInputRef.current.value = "";
  };

  const removeHeroPhoto = (idToRemove: string) => {
    setHeroPhotos(heroPhotos.filter(p => p.id !== idToRemove));
  };

  const handleCvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setCvFile(file);
  };

  const handleCancel = () => {
    setHeroPhotos([...originalHeroPhotos]);
    setCvFile(null);

    if (heroPhotoInputRef.current) heroPhotoInputRef.current.value = "";
    if (cvInputRef.current) cvInputRef.current.value = "";

    setForm({ ...originalForm });
    fetchData(); // Refetch to reset images
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = getToken();
      if (!token) throw new Error("No auth token");

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("job_title", form.job_title);
      formData.append("about_description", form.about_description);
      formData.append("is_available_for_work", form.is_available_for_work ? "1" : "0");
      formData.append("show_featured_projects_on_home", form.show_featured_projects_on_home ? "1" : "0");
      formData.append("show_featured_certificates_on_home", form.show_featured_certificates_on_home ? "1" : "0");
      formData.append("show_experiences_on_home", form.show_experiences_on_home ? "1" : "0");
      formData.append("show_tech_on_home", form.show_tech_on_home ? "1" : "0");

      heroPhotos.forEach((hp) => {
        if (hp.isExisting && hp.originalUrl) {
          formData.append("hero_photos[]", hp.originalUrl);
        } else if (hp.file) {
          formData.append("hero_photos[]", hp.file);
        }
      });

      if (heroPhotos.length === 0) {
        // Jika dihapus semua, kirim array kosong (atau penanda agar backend tahu dikosongkan)
        // FormData append tidak bisa array kosong secara langsung jika tidak dikirim.
        // Backend akan menganggap tidak ada perubahan jika hero_photos tidak dikirim.
        // Supaya backend tahu dikosongkan, kita bisa mengirim array string kosong, namun lebih baik backend membaca has('hero_photos') dari payload.
        formData.append("hero_photos[]", ""); // ini akan difilter di backend atau ditolak validasi?
        // Solusi lebih aman jika hero_photos wajib diperbarui:
        // Di ProfileController, backend mengecek $request->has('hero_photos'). 
        // Mengirimkan array kosong di FormData: 
      }
      if (cvFile) formData.append("cv", cvFile);

      const response = await saveProfile(token, formData);

      if (response.ok) {
        await alertSuccess("Profile berhasil diupdate!");

        if (heroPhotoInputRef.current) heroPhotoInputRef.current.value = "";
        if (cvInputRef.current) cvInputRef.current.value = "";

        setCvFile(null);

        fetchData();
      } else {
        const result = await response.json();
        await alertError(result.message || "Gagal menyimpan profile.");
      }
    } catch (error) {
      console.error(error);
      alertError("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans text-black">
      <div className="mb-10 border-b-4 border-black pb-4">
        <h1 className="text-3xl md:text-4xl font-black italic uppercase">MY PROFILE</h1>
        <p className="font-mono text-gray-600 mt-2">Introduce yourself to the world.</p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center font-mono animate-pulse border-4 border-black bg-white">
          LOADING PROFILE DATA...
        </div>
      ) : (
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 relative">
          <div className="absolute top-2 left-2 w-3 h-3 border-2 border-black rounded-full bg-gray-300"></div>
          <div className="absolute top-2 right-2 w-3 h-3 border-2 border-black rounded-full bg-gray-300"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 border-2 border-black rounded-full bg-gray-300"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 border-2 border-black rounded-full bg-gray-300"></div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-3 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b-2 border-black pb-2">
                  <label className="font-bold uppercase inline-block">Hero Photos (Max 10)</label>
                  <span className="font-mono text-sm">{heroPhotos.length}/10</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {heroPhotos.map((photo, index) => (
                    <div key={photo.id} className="relative group aspect-[4/5] border-4 border-black bg-gray-100 flex items-center justify-center overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <img loading="lazy" src={photo.preview} className="w-full h-full object-cover" alt={`Hero ${index + 1}`} />
                      <div className="absolute top-1 left-1 bg-black text-white px-2 py-0.5 text-xs font-bold font-mono">
                        {index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeHeroPhoto(photo.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 hover:bg-red-600 hover:scale-110 transition-transform shadow-sm opacity-0 group-hover:opacity-100"
                        title="Remove Photo"
                      >
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {heroPhotos.length < 10 && (
                    <label className="aspect-[4/5] border-4 border-black bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[4px] hover:translate-x-[4px]">
                      <Icon icon="lucide:plus" className="w-8 h-8 mb-2" />
                      <span className="font-mono text-xs uppercase font-bold text-center px-2">Add Photo</span>
                      <input 
                        ref={heroPhotoInputRef} 
                        type="file" 
                        onChange={handleHeroPhotosChange} 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs font-mono text-gray-500">* Photos will be displayed interactively on the home page. Hover changes to even photos, click changes to next odd photo.</p>
              </div>

              <div className="md:col-span-3 space-y-5 mt-6">
                <div>
                  <label className="block font-bold uppercase mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    type="text"
                    required
                    className="w-full border-2 border-black p-3 font-mono focus:outline-none focus:bg-gray-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
                    placeholder="Ex: Gilang Ages"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-2">Job Title / Role <span className="text-red-500">*</span></label>
                  <input
                    value={form.job_title}
                    onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                    type="text"
                    required
                    className="w-full border-2 border-black p-3 font-mono focus:outline-none focus:bg-gray-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400"
                    placeholder="Ex: Full Stack Developer"
                  />
                </div>
                
                <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded">
                  <label className="block font-bold uppercase mb-3">Available for Work</label>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={form.is_available_for_work} 
                        onChange={(e) => setForm({ ...form, is_available_for_work: e.target.checked })} 
                        className="sr-only" 
                      />
                      <div className={`block w-14 h-8 transition-colors border-2 border-black ${form.is_available_for_work ? 'bg-black' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 transition-transform border-2 border-black ${form.is_available_for_work ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="font-bold font-mono text-sm text-gray-700">
                      {form.is_available_for_work ? 'Yes, show "Hire Me" button' : 'No, hide "Hire Me" button'}
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block font-bold uppercase mb-2">About Description <span className="text-red-500">*</span></label>
                  <textarea
                    value={form.about_description}
                    onChange={(e) => setForm({ ...form, about_description: e.target.value })}
                    rows={5}
                    required
                    className="w-full border-2 border-black p-3 font-mono focus:outline-none focus:bg-gray-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 resize-none"
                    placeholder="Tell the world who you are..."
                  />
                </div>
                <div className="bg-gray-50 border-2 border-black p-4 border-dashed">
                  <label className="block font-bold uppercase mb-2 flex items-center gap-2">
                    <Icon icon="lucide:file-text" />
                    Curriculum Vitae (PDF)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={cvInputRef}
                      type="file"
                      onChange={handleCvChange}
                      accept=".pdf"
                      className="block w-full text-sm font-mono file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-sm file:font-bold file:uppercase file:bg-white file:text-black hover:file:bg-black hover:file:text-white cursor-pointer"
                    />
                  </div>
                  {currentCvPath && !cvFile && (
                    <div className="mt-2 text-xs font-mono">
                      Current CV:
                      <a href={currentCvPath} target="_blank" rel="noreferrer" className="text-black ml-1 underline font-bold hover:text-black">
                        View PDF
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 p-6 shadow-sm">
              <h3 className="font-bold uppercase text-lg mb-4 border-b-2 border-yellow-300 pb-2 flex items-center gap-2">
                <Icon icon="lucide:layout-dashboard" className="w-5 h-5 text-yellow-600" />
                Homepage Section Visibility
              </h3>
              <p className="text-sm font-mono text-gray-600 mb-6">Toggle which sections should be displayed on the public landing page (/).</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold uppercase text-sm">Tech Stack</label>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={form.show_tech_on_home} 
                        onChange={(e) => setForm({ ...form, show_tech_on_home: e.target.checked })} 
                        className="sr-only" 
                      />
                      <div className={`block w-14 h-8 transition-colors border-2 border-black ${form.show_tech_on_home ? 'bg-black' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 transition-transform border-2 border-black ${form.show_tech_on_home ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="font-bold font-mono text-sm text-gray-700">
                      {form.show_tech_on_home ? 'Visible' : 'Hidden'}
                    </span>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold uppercase text-sm">Featured Projects</label>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={form.show_featured_projects_on_home} 
                        onChange={(e) => setForm({ ...form, show_featured_projects_on_home: e.target.checked })} 
                        className="sr-only" 
                      />
                      <div className={`block w-14 h-8 transition-colors border-2 border-black ${form.show_featured_projects_on_home ? 'bg-black' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 transition-transform border-2 border-black ${form.show_featured_projects_on_home ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="font-bold font-mono text-sm text-gray-700">
                      {form.show_featured_projects_on_home ? 'Visible' : 'Hidden'}
                    </span>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold uppercase text-sm">Featured Certificates</label>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={form.show_featured_certificates_on_home} 
                        onChange={(e) => setForm({ ...form, show_featured_certificates_on_home: e.target.checked })} 
                        className="sr-only" 
                      />
                      <div className={`block w-14 h-8 transition-colors border-2 border-black ${form.show_featured_certificates_on_home ? 'bg-black' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 transition-transform border-2 border-black ${form.show_featured_certificates_on_home ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="font-bold font-mono text-sm text-gray-700">
                      {form.show_featured_certificates_on_home ? 'Visible' : 'Hidden'}
                    </span>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold uppercase text-sm">Experiences</label>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={form.show_experiences_on_home} 
                        onChange={(e) => setForm({ ...form, show_experiences_on_home: e.target.checked })} 
                        className="sr-only" 
                      />
                      <div className={`block w-14 h-8 transition-colors border-2 border-black ${form.show_experiences_on_home ? 'bg-black' : 'bg-gray-300'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 transition-transform border-2 border-black ${form.show_experiences_on_home ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="font-bold font-mono text-sm text-gray-700">
                      {form.show_experiences_on_home ? 'Visible' : 'Hidden'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-black pt-6 flex flex-col md:flex-row justify-end gap-3 md:gap-4">
              {hasChanges && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="w-full md:w-auto justify-center bg-white text-black hover:bg-black hover:text-white border-2 border-black px-4 py-2 md:px-6 md:py-3 font-bold text-sm md:text-lg uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Icon icon="lucide:x" className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Cancel</span>
                </button>
              )}

              <button
                type="submit"
                disabled={!hasChanges || isSubmitting}
                className={`w-full md:w-auto justify-center px-4 py-2 md:px-8 md:py-3 font-black text-sm md:text-lg uppercase transition-all flex items-center gap-2 ${
                  !hasChanges || isSubmitting
                    ? 'bg-gray-200 text-gray-400 border-2 border-gray-300 cursor-not-allowed'
                    : 'bg-black text-white hover:text-black hover:bg-gray-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none'
                }`}
              >
                {isSubmitting ? (
                  <Icon icon="lucide:loader-2" className="animate-spin w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <span>{hasChanges ? "Save Changes" : "No Changes"}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
