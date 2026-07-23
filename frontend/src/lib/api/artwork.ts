import { Artwork } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAllArtworks = async (queryParams: Record<string, string> = {}): Promise<Artwork[]> => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${API_URL}/artworks${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      next: { revalidate: 60, tags: ['artworks'] },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch artworks', error);
    return [];
  }
};

export const getArtworkById = async (id: string | number): Promise<Artwork | null> => {
  try {
    const res = await fetch(`${API_URL}/artworks/${id}`, {
      next: { revalidate: 60, tags: ['artworks', `artwork-${id}`] },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch artwork', error);
    return null;
  }
};

export const createArtwork = async (token: string, formData: FormData) => {
  return await fetch(`${API_URL}/artworks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });
};

export const updateArtwork = async (token: string, id: string | number, formData: FormData) => {
  return await fetch(`${API_URL}/artworks/${id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });
};

export const deleteArtwork = async (token: string, id: string | number) => {
  return await fetch(`${API_URL}/artworks/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};

export const reorderArtworks = async (token: string, ordered_ids: (string | number)[]) => {
  return await fetch(`${API_URL}/artworks/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({ ordered_ids }),
  });
};
