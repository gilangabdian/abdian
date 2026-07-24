import { ContactMessage } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const submitContact = async (formData: FormData) => {
  return await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  });
};

export const getMessages = async (token: string, page: number = 1) => {
  return await fetch(`${API_URL}/admin/messages?page=${page}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};

export const markAsRead = async (token: string, id: string | number) => {
  return await fetch(`${API_URL}/admin/messages/${id}/read`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};

export const deleteMessage = async (token: string, id: string | number) => {
  return await fetch(`${API_URL}/admin/messages/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};

export const getAllContacts = async (): Promise<any[]> => {
  try {
    const res = await fetch(`${API_URL}/contacts`, {
      next: { revalidate: 60, tags: ['contacts'] },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (error) {
    console.error('Failed to fetch contacts', error);
    return [];
  }
};

export const adminUploadContact = async (token: string, data: any) => {
  return await fetch(`${API_URL}/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const adminUpdateContact = async (token: string, id: string | number, data: any) => {
  return await fetch(`${API_URL}/contacts/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const adminDeleteContact = async (token: string, id: string | number) => {
  return await fetch(`${API_URL}/contacts/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};

