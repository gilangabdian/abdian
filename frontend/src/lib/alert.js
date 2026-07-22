import Swal from "sweetalert2";

export const alertSuccess = async (message) => {
  return Swal.fire({
    icon: "success",
    title: "Success",
    text: message,
  });
};

export const alertError = async (message) => {
  return Swal.fire({
    icon: "error",
    title: "Ups",
    text: message,
  });
};

export const alertPrompt = async (title, placeholder = "") => {
  const result = await Swal.fire({
    title: title,
    input: "text",
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonColor: "#000",
    cancelButtonColor: "#d33",
    confirmButtonText: "Simpan",
  });
  return result.isConfirmed ? result.value : null;
};

export const alertConfirm = async (message) => {
  const result = await Swal.fire({
    title: "Hapus Skill?",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#000",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, Hapus!",
  });
  return result.isConfirmed;
};

export const alertConfirmProject = async (message) => {
  const result = await Swal.fire({
    title: "Hapus Project?",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#000",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, Hapus!",
  });
  return result.isConfirmed;
};

export const alertConfirmContact = async (message) => {
  const result = await Swal.fire({
    title: "Hapus Contact?",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#000",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, Hapus!",
  });
  return result.isConfirmed;
};

export const alertConfirmCertificate = async (message) => {
  const result = await Swal.fire({
    title: "Hapus Experience?",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#000",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, Hapus!",
  });
  return result.isConfirmed;
};

export const alertConfirmExperience = async (message) => {
  const result = await Swal.fire({
    title: "Hapus Certificate?",
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#000",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, Hapus!",
  });
  return result.isConfirmed;
};

// --- Neo-Brutalist Visitor Alerts ---
const neoBrutalistConfig = {
  confirmButtonColor: "#000",
  customClass: {
    popup: 'border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-sans',
    confirmButton: 'bg-black text-white rounded-none border-2 border-black font-bold uppercase px-4 py-2 m-2 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]',
    cancelButton: 'bg-white text-black rounded-none border-2 border-black font-bold uppercase px-4 py-2 m-2 hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]'
  }
};

export const alertConfirmVisitor = async (message) => {
  const result = await Swal.fire({
    ...neoBrutalistConfig,
    title: "Are you sure?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  });
  return result.isConfirmed;
};

export const alertConfirmClearAllVisitors = async (message) => {
  const result = await Swal.fire({
    ...neoBrutalistConfig,
    title: "Clear All Logs?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, clear all!",
  });
  return result.isConfirmed;
};

export const alertSuccessVisitor = async (title, message) => {
  return Swal.fire({
    ...neoBrutalistConfig,
    title: title,
    text: message,
    icon: "success",
  });
};
