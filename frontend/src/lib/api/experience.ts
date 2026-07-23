import { Experience } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAllExperiences = async (queryParams: Record<string, string> = {}): Promise<Experience[]> => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${API_URL}/experiences${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      next: { revalidate: 60, tags: ['experiences'] },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch experiences', error);
    return [];
  }
};

export const getExperienceById = async (id: string | number): Promise<Experience | null> => {
  try {
    const res = await fetch(`${API_URL}/experiences/${id}`, {
      next: { revalidate: 60, tags: ['experiences', `experience-${id}`] },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch experience', error);
    return null;
  }
};

export const createExperience = async (token: string, data: any) => {
  return await fetch(`${API_URL}/experiences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const updateExperience = async (token: string, id: string | number, data: any) => {
  return await fetch(`${API_URL}/experiences/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const adminDeleteExperience = async (token: string, id: string | number) => {
  return await fetch(`${API_URL}/experiences/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};

export const reorderExperiences = async (token: string, ordered_ids: (string | number)[]) => {
  return await fetch(`${API_URL}/experiences/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({ ordered_ids }),
  });
};
