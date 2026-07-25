"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { adminUploadCertificate, adminUpdateCertificate, getSingleCertificate } from "@/lib/api/certificate";
import { alertSuccess, alertError } from "@/lib/alert";
import { marked } from "marked";

export default function CertificateFormClient({ certId }: { certId?: string }) {
  const router = useRouter();
  const isEditMode = !!certId;

  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownTypeRef = useRef<HTMLDivElement>(null);
  
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const typeOptions = [
    { value: 'course', label: 'Course' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'bootcamp', label: 'Bootcamp' },
    { value: 'competition', label: 'Competition' },
  ];

  const [form, setForm] = useState({
    title: "",
    issuer: "",
    credential_link: "",
    description: "",
    is_featured: false,
    start_date: "",
    end_date: "",
    has_no_expiration: false,
    type: "",
  });

  const renderMarkdown = (text: string) => {
    if (!text) return { __html: "" };
    return { __html: marked.parse(text, { breaks: true }) };
  };

  const selectType = (value: string) => {
    setForm({ ...form, type: value });
    setIsTypeDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownTypeRef.current && !dropdownTypeRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (isEditMode) {
        setIsLoading(true);
        try {
          const result = await getSingleCertificate(certId);
          const data = result;

          if (data) {
            setForm({
              title: data.title || "",
              issuer: data.issuer || "",
              credential_link: data.credential_link || "",
              description: data.description || "",
              is_featured: !!data.is_featured,
              start_date: data.start_date ? data.start_date.substring(0, 10) : "",
              end_date: data.end_date ? data.end_date.substring(0, 10) : "",
              has_no_expiration: !!data.has_no_expiration,
              type: data.type || "",
            });

            if (data.image_path || data.image_url) {
              setPreviewImage(data.image_url || data.image_path || null);
            }
          }
        } catch (error) {
          console.error(error);
          alertError("Gagal mengambil data sertifikat.");
          router.push("/admin/certificates");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchCertificate();
  }, [certId, isEditMode, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.issuer) {
      alertError("Judul dan Penerbit (Issuer) wajib diisi!");
      return;
    }
    if (!isEditMode && !file) {
      alertError("Gambar sertifikat wajib diupload!");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("issuer", form.issuer);
      formData.append("description", form.description || "");
      formData.append("credential_link", form.credential_link || "");
      formData.append("is_featured", form.is_featured ? "1" : "0");
      formData.append("start_date", form.start_date);
      formData.append("end_date", form.end_date);
      formData.append("has_no_expiration", form.has_no_expiration ? "1" : "0");
      
      if (form.type) {
        formData.append("type", form.type);
      }

      if (file) {
        formData.append("image", file);
      }

      let response;
      if (isEditMode) {
        formData.append("_method", "PUT");
        response = await adminUpdateCertificate(token, parseInt(certId as string), formData);
      } else {
        response = await adminUploadCertificate(token, formData);
      }

      if (response.ok) {
        await alertSuccess(isEditMode ? "Sertifikat berhasil diupdate!" : "Sertifikat berhasil ditambahkan!");
        router.push("/admin/certificates");
      } else {
        const responseBody = await response.json();
        await alertError(responseBody.message || "Gagal menyimpan data.");
      }
    } catch (error) {
      console.error(error);
      alertError("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <Link
          href="/admin/certificates"
          className="inline-flex items-center gap-2 font-bold font-mono text-sm mb-4 hover:underline hover:text-gray-500 transition-colors"
        >
          <Icon icon="lucide:arrow-left" className="text-lg" />
          BACK TO LIST
        </Link>

        <div className="border-b-4 border-black pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-black italic uppercase">
              {isEditMode ? "EDIT CERTIFICATE" : "UPLOAD CERTIFICATE"}
            </h1>
            <p className="font-mono text-gray-600 mt-2 text-sm md:text-base">
              {isEditMode ? "Update your achievement details." : "Add a new milestone to your portfolio."}
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
                Certificate Title
                <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                type="text"
                placeholder="e.g. AWS Certified Solutions Architect"
                className="w-full p-4 border-2 border-black font-bold focus:bg-gray-50 focus:outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
                  <Icon icon="lucide:building-2" className="text-lg" />
                  Issuer (Penerbit)
                  <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.issuer}
                  onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                  type="text"
                  placeholder="e.g. Google, Udemy, Dicoding"
                  className="w-full p-3 border-2 border-black font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
              <div>
                <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
                  <Icon icon="lucide:link" className="text-lg" />
                  Credential Link
                </label>
                <input
                  value={form.credential_link}
                  onChange={(e) => setForm({ ...form, credential_link: e.target.value })}
                  type="url"
                  placeholder="https://..."
                  className="w-full p-3 border-2 border-black font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="font-black text-xs uppercase flex items-center gap-2">
                    <Icon icon="lucide:calendar-check" className="text-lg" />
                    End Date
                    {!form.has_no_expiration && <span className="text-red-500">*</span>}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="no_expiration"
                      checked={form.has_no_expiration}
                      onChange={(e) => setForm({ ...form, has_no_expiration: e.target.checked, end_date: e.target.checked ? "" : form.end_date })}
                      className="h-4 w-4 cursor-pointer accent-black"
                    />
                    <label htmlFor="no_expiration" className="text-[10px] font-mono text-gray-500 cursor-pointer uppercase font-bold">Lifetime?</label>
                  </div>
                </div>
                <input
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  type="date"
                  disabled={form.has_no_expiration}
                  className={`w-full p-3 border-2 border-black font-mono text-sm focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${form.has_no_expiration ? 'bg-gray-200 cursor-not-allowed opacity-50' : 'focus:bg-gray-50'}`}
                />
              </div>
            </div>

            <div className="relative" ref={dropdownTypeRef}>
              <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
                <Icon icon="lucide:tag" className="text-lg" />
                Type
                <span className="text-gray-400 text-[10px] normal-case ml-1">(optional)</span>
              </label>
              <div className="relative z-10">
                <button
                  type="button"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className={`w-full font-mono bg-white flex justify-between items-center focus:outline-none transition-all text-left text-sm border-2 border-black px-3 ${
                    isTypeDropdownOpen
                      ? "border-b-0 pb-[14px] pt-3 bg-white shadow-none"
                      : "py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  }`}
                >
                  <span className="truncate">{form.type ? typeOptions.find(o => o.value === form.type)?.label : '— No Type —'}</span>
                  <Icon
                    icon="lucide:chevron-down"
                    className={`transition-transform duration-200 ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isTypeDropdownOpen && (
                  <div className="absolute top-full left-0 w-full bg-white border-2 border-t-0 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto">
                    <div
                      onClick={() => selectType('')}
                      className={`p-3 border-b-2 border-black last:border-b-0 cursor-pointer text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-between group font-bold ${form.type === '' ? 'bg-gray-200' : ''}`}
                    >
                      <span>— No Type —</span>
                      {form.type === '' && <Icon icon="lucide:check" className="group-hover:text-black text-black" />}
                    </div>
                    {typeOptions.map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => selectType(opt.value)}
                        className={`p-3 border-b-2 border-black last:border-b-0 cursor-pointer text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-between group font-bold ${form.type === opt.value ? 'bg-gray-200' : ''}`}
                      >
                        <span>{opt.label}</span>
                        {form.type === opt.value && <Icon icon="lucide:check" className="group-hover:text-black text-black" />}
                      </div>
                    ))}
                  </div>
                )}
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
                  Feature Certificate?
                </label>
              </div>
              <div className="text-xs font-mono text-gray-500 border-l-2 border-black pl-4 hidden sm:block">
                Pinned to Homepage
                <br />
                Hero Section.
              </div>
            </div>

            <div>
              <label className="block font-black mb-2 flex justify-between items-end text-sm uppercase">
                <span className="border-b-2 border-black inline-block">Description</span>
                <span className="text-[10px] text-gray-400 capitalize font-mono">Markdown: **bold**, *italic*, - list</span>
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  placeholder="Briefly describe what you learned or achieved..."
                  className="w-full p-4 border-2 border-black font-medium focus:bg-gray-50 focus:outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] resize-y"
                ></textarea>

                <div className="border-2 border-black border-dashed p-3 bg-gray-50 overflow-y-auto max-h-[150px]">
                  <div className="text-[10px] font-black uppercase text-gray-400 mb-2">Live Preview:</div>
                  <div dangerouslySetInnerHTML={renderMarkdown(form.description)} className="markdown-preview font-mono text-sm"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[350px] flex flex-col gap-6 flex-shrink-0">
            <div>
              <label className="block font-black mb-2 border-b-2 border-black inline-block text-sm uppercase">
                Certificate Image
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>

              <div
                className="relative w-full aspect-[4/3] border-4 border-black bg-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                {previewImage ? (
                  <div className="relative w-full h-full p-2 bg-white">
                    <img loading="lazy" src={previewImage} className="w-full h-full object-contain border-2 border-black" alt="Preview" />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(); }}
                      className="absolute top-0 right-0 bg-white text-black hover:bg-black hover:text-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform z-10"
                      type="button"
                    >
                      <Icon icon="lucide:trash-2" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="bg-white p-4 inline-block border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform duration-300">
                      <Icon icon="lucide:image-plus" className="text-4xl text-black" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg uppercase">{isEditMode ? "Change Image" : "Upload Image"}</h4>
                      <p className="text-xs font-mono text-gray-500">Max 2MB (JPG/PNG)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t-4 border-black border-dashed flex flex-col gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-black text-white hover:text-black hover:bg-gray-100 border-2 border-black font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-800 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase italic"
              >
                {isLoading ? (
                  <>
                    <Icon icon="svg-spinners:3-dots-fade" className="text-2xl" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isEditMode ? "Save Changes" : "Publish Certificate"}</span>
                    <Icon icon="lucide:check-circle" />
                  </>
                )}
              </button>

              <Link
                href="/admin/certificates"
                className="w-full py-3 bg-white text-black border-2 border-black font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex items-center justify-center gap-2 uppercase"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
