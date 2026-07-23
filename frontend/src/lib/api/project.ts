import { Project } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAllProjects = async (queryParams: Record<string, string> = {}): Promise<Project[]> => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${API_URL}/projects${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      next: { revalidate: 60, tags: ['projects'] },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch projects', error);
    return [];
  }
};

export const getSingleProject = async (idOrSlug: string | number): Promise<Project | null> => {
  try {
    const res = await fetch(`${API_URL}/projects/${idOrSlug}`, {
      next: { revalidate: 60, tags: ['projects', `project-${idOrSlug}`] },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch single project', error);
    return null;
  }
};

export const adminUploadProject = async (token: string, formData: FormData) => {
  return await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });
};

export const adminUpdateProject = async (token: string, id: string | number, formData: FormData) => {
  return await fetch(`${API_URL}/projects/${id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });
};

export const adminDeleteProject = async (token: string, id: string | number) => {
  return await fetch(`${API_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};
