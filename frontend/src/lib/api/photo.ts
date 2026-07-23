import { Photo } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAllPhotos = async (queryParams: Record<string, string> = {}): Promise<Photo[]> => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${API_URL}/photos${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      next: { revalidate: 60, tags: ['photos'] },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch photos', error);
    return [];
  }
};

export const getPhotoById = async (id: string | number): Promise<Photo | null> => {
  try {
    const res = await fetch(`${API_URL}/photos/${id}`, {
      next: { revalidate: 60, tags: ['photos', `photo-${id}`] },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch photo', error);
    return null;
  }
};

export const createPhoto = async (token: string, formData: FormData) => {
  return await fetch(`${API_URL}/photos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });
};

export const updatePhoto = async (token: string, id: string | number, formData: FormData) => {
  return await fetch(`${API_URL}/photos/${id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });
};

export const deletePhoto = async (token: string, id: string | number) => {
  return await fetch(`${API_URL}/photos/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};
