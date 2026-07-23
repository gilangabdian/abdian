export const getSkills = async () => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/skills`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
};

export const getSingleSkill = async (id) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/skills/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
};

export const addSkill = async (token, formData) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/skills`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
  });
};

export const updateSkill = async (token, id, data) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/skills/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const deleteSkill = async (token, id) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/skills/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};

export const bulkDeleteSkills = async (token, ids) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/skills/bulk-delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify({ ids }),
  });
};

export const reorderSkills = async (token, ordered_ids) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/skills/reorder`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify({ ordered_ids }),
  });
};

export const updateSkillCategory = async (token, oldName, newName) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/skills/categories/${encodeURIComponent(oldName)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: JSON.stringify({ newName }),
  });
};

export const deleteSkillCategory = async (token, categoryName) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/skills/categories/${encodeURIComponent(categoryName)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
};
