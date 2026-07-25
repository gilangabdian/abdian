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

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [secondaryImagePreview, setSecondaryImagePreview] = useState<string | null>(null);
  const [secondaryImageFile, setSecondaryImageFile] = useState<File | null>(null);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [currentCvPath, setCurrentCvPath] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const secondaryImageInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const hasChanges = useMemo(() => {
    const hasNewFiles =
      photoFile !== null ||
      secondaryImageFile !== null ||
      cvFile !== null;

    const hasTextChanges =
      form.name !== originalForm.name ||
      form.job_title !== originalForm.job_title ||
      form.about_description !== originalForm.about_description ||
      form.is_available_for_work !== originalForm.is_available_for_work ||
      form.show_featured_projects_on_home !== originalForm.show_featured_projects_on_home ||
      form.show_featured_certificates_on_home !== originalForm.show_featured_certificates_on_home ||
      form.show_experiences_on_home !== originalForm.show_experiences_on_home ||
      form.show_tech_on_home !== originalForm.show_tech_on_home;

    return hasNewFiles || hasTextChanges;
  }, [form, originalForm, photoFile, secondaryImageFile, cvFile]);

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

        if (result.about.photo_url) setPhotoPreview(result.about.photo_url);
        if (result.about.secondary_image_url) setSecondaryImagePreview(result.about.secondary_image_url);
        if (result.about.cv_url) setCurrentCvPath(result.about.cv_url);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSecondaryImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSecondaryImageFile(file);
      setSecondaryImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setCvFile(file);
  };

  const handleCancel = () => {
    setPhotoFile(null);
    setSecondaryImageFile(null);
    setCvFile(null);

    if (photoInputRef.current) photoInputRef.current.value = "";
    if (secondaryImageInputRef.current) secondaryImageInputRef.current.value = "";
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

      if (photoFile) formData.append("photo_path", photoFile);
      if (secondaryImageFile) formData.append("secondary_image", secondaryImageFile);
      if (cvFile) formData.append("cv", cvFile);

      const response = await saveProfile(token, formData);

      if (response.ok) {
        await alertSuccess("Profile berhasil diupdate!");

        if (photoInputRef.current) photoInputRef.current.value = "";
        if (secondaryImageInputRef.current) secondaryImageInputRef.current.value = "";
        if (cvInputRef.current) cvInputRef.current.value = "";

        setPhotoFile(null);
        setSecondaryImageFile(null);
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
              <div className="md:col-span-1 flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <label className="font-bold uppercase border-b-2 border-black inline-block w-max">Profile Picture</label>
                  <div className="relative group">
                    <div className="w-full border-4 border-black bg-gray-100 flex items-center justify-center overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {photoPreview ? (
                        <img loading="lazy" src={photoPreview} className="w-full h-auto" alt="Profile Preview" />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <Icon icon="lucide:image" className="w-12 h-12 mb-2" />
                          <span className="font-mono text-xs uppercase">No Image</span>
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-2 right-2 bg-white border-2 border-black p-2 cursor-pointer hover:scale-110 transition-transform shadow-sm" title="Change Photo">
                      <Icon icon="lucide:camera" className="w-5 h-5" />
                      <input ref={photoInputRef} type="file" onChange={handlePhotoChange} accept="image/*" className="hidden" />
                    </label>
                  </div>
                  <p className="text-xs font-mono text-gray-500 text-center">*Main Photo (JPG/PNG)</p>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="font-bold uppercase border-b-2 border-black inline-block w-max">Hero Swap Image</label>
                  <div className="relative group">
                    <div className="w-full aspect-[4/5] border-4 border-black bg-gray-100 flex items-center justify-center overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {secondaryImagePreview ? (
                        <img src={secondaryImagePreview} loading="lazy" className="w-full h-full object-cover" alt="Secondary Preview" />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <Icon icon="lucide:image-plus" className="w-12 h-12 mb-2" />
                          <span className="font-mono text-xs uppercase">No Swap Image</span>
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-2 right-2 bg-gray-100 border-2 border-black p-2 cursor-pointer hover:scale-110 transition-transform shadow-sm" title="Change Secondary Photo">
                      <Icon icon="lucide:camera" className="w-5 h-5" />
                      <input ref={secondaryImageInputRef} type="file" onChange={handleSecondaryImageChange} accept="image/*" className="hidden" />
                    </label>
                  </div>
                  <p className="text-xs font-mono text-gray-500 text-center">*Shown on Click/Hover (Optional)</p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-5">
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
