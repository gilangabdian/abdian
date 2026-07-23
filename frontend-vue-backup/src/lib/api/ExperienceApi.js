export const getAllExperiences = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${import.meta.env.VITE_APP_PATH}/experiences?${query}` : `${import.meta.env.VITE_APP_PATH}/experiences`;
  return await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
};

export const getSingleExperience = async (id) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/experiences/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
};

export const adminUploadExperience = async (token, payload) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/experiences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const adminUpdateExperience = async (token, id, payload) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/experiences/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const adminDeleteExperience = async (token, id) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/experiences/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};
