"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import {
  getAllContacts,
  adminUploadContact,
  adminUpdateContact,
  adminDeleteContact,
} from "@/lib/api/contact";
import { alertSuccess, alertError, alertConfirmContact } from "@/lib/alert";

export default function ContactClient() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Form & Edit Mode
  const formRef = useRef<HTMLDivElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState({
    platform_name: "",
    url: "",
    icon: "",
  });

  const commonIcons = [
    { name: "Instagram", id: "mdi:instagram" },
    { name: "GitHub", id: "mdi:github" },
    { name: "LinkedIn", id: "mdi:linkedin" },
    { name: "Twitter/X", id: "simple-icons:x" },
    { name: "Email", id: "mdi:email" },
    { name: "WhatsApp", id: "mdi:whatsapp" },
    { name: "Discord", id: "simple-icons:discord" },
    { name: "YouTube", id: "mdi:youtube" },
  ];

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const data = await getAllContacts();
      setContacts(data || []);
    } catch (error) {
      console.error(error);
      alertError("Gagal mengambil data kontak");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      platform_name: "",
      url: "",
      icon: "",
    });
    setIsEditing(false);
    setEditId(null);
  };

  const selectCommonIcon = (item: any) => {
    setForm((prev) => ({
      ...prev,
      platform_name: item.name,
      icon: item.id,
    }));
  };

  const handleEdit = (contact: any) => {
    setIsEditing(true);
    setEditId(contact.id);

    setForm({
      platform_name: contact.platform_name,
      url: contact.url,
      icon: contact.icon,
    });

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.platform_name || !form.url || !form.icon) {
      alertError("Mohon lengkapi Nama, URL, dan Icon!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token") || "";
      const payload = {
        platform_name: form.platform_name,
        url: form.url,
        icon: form.icon,
      };

      let response;
      if (isEditing && editId) {
        response = await adminUpdateContact(token, editId, payload);
      } else {
        response = await adminUploadContact(token, payload);
      }

      if (response.ok) {
        alertSuccess(isEditing ? "Kontak berhasil diupdate!" : "Kontak berhasil ditambahkan!");
        resetForm();
        await fetchContacts();
      } else {
        const err = await response.json();
        alertError(err.message || "Gagal menyimpan kontak");
      }
    } catch (e) {
      console.error(e);
      alertError("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await alertConfirmContact("Yakin ingin menghapus kontak ini?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token") || "";
      const response = await adminDeleteContact(token, id);
      if (response.ok) {
        alertSuccess("Kontak berhasil dihapus");
        await fetchContacts();
      } else {
        alertError("Gagal menghapus kontak");
      }
    } catch (e) {
      console.error(e);
      alertError("Terjadi kesalahan sistem");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10 border-b-4 border-black pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic">CONTACT MANAGER</h1>
          <p className="font-mono text-gray-600 mt-2 text-sm md:text-base">Manage social media & links.</p>
        </div>
        <div className="hidden md:block bg-black text-white px-3 py-1 font-mono font-bold">
          {contacts.length} LINKS
        </div>
      </div>

      <div
        ref={formRef}
        className={`border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-colors mb-12 scroll-mt-24 ${
          isEditing ? "bg-gray-50" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black text-xl md:text-2xl flex items-center gap-2 uppercase italic">
            <Icon icon={isEditing ? "lucide:edit" : "lucide:plus-circle"} />
            {isEditing ? "EDIT CONTACT" : "ADD NEW CONTACT"}
          </h2>
          {isEditing && (
            <button
              onClick={resetForm}
              type="button"
              className="text-xs font-bold text-black underline hover:text-gray-500"
            >
              CANCEL
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold mb-2 border-b-2 border-black inline-block text-sm">
                PLATFORM NAME <span className="text-red-500">*</span>
              </label>
              <input
                value={form.platform_name}
                onChange={(e) => setForm({ ...form, platform_name: e.target.value })}
                type="text"
                placeholder="e.g. Instagram"
                className="w-full p-3 border-2 border-black font-mono focus:bg-gray-100 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold mb-2 border-b-2 border-black inline-block text-sm">
                LINK / URL <span className="text-red-500">*</span>
              </label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                type="text"
                placeholder="https://..., email pakai mailto:"
                className="w-full p-3 border-2 border-black font-mono focus:bg-gray-100 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2 border-b-2 border-black inline-block text-sm">
              ICON CODE (Iconify) <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  type="text"
                  placeholder="mdi:instagram"
                  className="w-full p-3 border-2 border-black font-mono bg-gray-50 focus:bg-white focus:outline-none"
                />
                <div className="w-12 h-12 border-2 border-black flex items-center justify-center bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                  {form.icon ? (
                    <Icon icon={form.icon} className="text-2xl" />
                  ) : (
                    <span className="text-xs text-gray-400">?</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {commonIcons.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectCommonIcon(item)}
                    className="px-2 py-1 text-xs font-mono border border-black hover:bg-black hover:text-white transition-colors"
                    title="Pakai icon ini"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs mt-1 text-gray-500 font-mono">
              *Cari kode icon di{" "}
              <a href="https://icones.js.org/" target="_blank" className="font-bold text-black underline">
                Icones.js.org
              </a>
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`h-12 font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isEditing ? "bg-white hover:bg-gray-500" : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isSubmitting ? "SAVING..." : isEditing ? "UPDATE CONTACT" : "ADD CONTACT"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-black text-2xl mb-6 uppercase flex items-center gap-3">
          <Icon icon="lucide:share-2" />
          Contacts
        </h2>

        {isLoading ? (
          <div className="text-center py-10 font-mono text-gray-500">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12 border-4 border-black bg-gray-50 flex flex-col items-center gap-4">
            <Icon icon="lucide:ghost" className="text-6xl text-gray-300" />
            <div>
              <h3 className="font-black text-xl uppercase">Nothing here yet</h3>
              <p className="font-mono text-sm text-gray-500">Start adding your first contact above!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="group relative bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center p-4 gap-4"
              >
                <div className="w-14 h-14 flex items-center justify-center border-2 border-black bg-gray-50 shrink-0">
                  <Icon icon={contact.icon} className="text-3xl" />
                </div>

                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3 className="font-black text-lg truncate uppercase italic">{contact.platform_name}</h3>
                  <a
                    href={contact.url}
                    target="_blank"
                    className="text-xs font-mono text-gray-600 truncate block hover:text-black hover:underline"
                  >
                    {contact.url}
                  </a>
                </div>

                <div className="absolute top-2 right-2 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white border border-black p-1 shadow-sm md:border-none md:shadow-none md:bg-transparent">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-1.5 bg-white border border-black hover:bg-gray-500 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
                    title="Edit"
                  >
                    <Icon icon="lucide:edit-2" width="14" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="bg-red-500 text-white hover:bg-red-600 p-1.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
                    title="Hapus"
                  >
                    <Icon icon="lucide:trash-2" width="14" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
