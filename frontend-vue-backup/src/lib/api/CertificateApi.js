export const getAllCertificates = async (queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const url = `${import.meta.env.VITE_APP_PATH}/certificates${queryString ? `?${queryString}` : ""}`;
  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
};

export const getSingleCertificate = async (id) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/certificates/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
};

export const adminUploadCertificate = async (token, formData) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/certificates`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
  });
};

export const adminUpdateCertificate = async (token, id, formData) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/certificates/${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
  });
};

export const adminDeleteCertificate = async (token, id) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/certificates/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};
