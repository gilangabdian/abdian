export const getAllContacts = async () => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/contacts`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
};

export const getSingleContact = async (id) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/contacts/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
};

export const adminUploadContact = async (token, { platform_name, url, icon }) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      platform_name,
      url,
      icon,
    }),
  });
};

export const adminUpdateContact = async (token, id, { platform_name, url, icon }) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/contacts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      platform_name,
      url,
      icon,
    }),
  });
};

export const adminDeleteContact = async (token, id) => {
  return await fetch(`${import.meta.env.VITE_APP_PATH}/contacts/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
