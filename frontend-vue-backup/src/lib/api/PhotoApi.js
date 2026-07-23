const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
};

export const getAllPhotos = async () => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/photos`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
};

export const getPhotoById = async (id) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/photos/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
};

export const createPhoto = async (formData) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/photos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
};

export const updatePhoto = async (id, formData) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/photos/${id}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
};

export const deletePhoto = async (id) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/photos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};
