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
