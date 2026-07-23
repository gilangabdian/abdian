export const getProfile = async () => {
  // Tambahkan timestamp (?t=...) agar browser selalu mengambil data segar
  const timestamp = new Date().getTime();
  return await fetch(`${import.meta.env.VITE_APP_PATH}/profile?t=${timestamp}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      // Opsional: Header eksplisit untuk mematikan cache
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
};

export const saveProfile = async (token, formData) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/profile`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
  });
};
