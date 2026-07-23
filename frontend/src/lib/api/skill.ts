import { Skill } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getSkills = async (): Promise<Skill[]> => {
  try {
    const res = await fetch(`${API_URL}/skills`, {
      next: { revalidate: 60, tags: ['skills'] },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch skills', error);
    return [];
  }
};

export const getSingleSkill = async (id: string | number): Promise<Skill | null> => {
  try {
    const res = await fetch(`${API_URL}/skills/${id}`, {
      next: { revalidate: 60, tags: ['skills', `skill-${id}`] },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch skill', error);
    return null;
  }
};

export const addSkill = async (token: string, formData: FormData) => {
  return await fetch(`${API_URL}/skills`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });
};

export const updateSkill = async (token: string, id: string | number, data: any) => {
  return await fetch(`${API_URL}/skills/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const deleteSkill = async (token: string, id: string | number) => {
  return await fetch(`${API_URL}/skills/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};

export const bulkDeleteSkills = async (token: string, ids: (string | number)[]) => {
  return await fetch(`${API_URL}/skills/bulk-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
};

export const reorderSkills = async (token: string, ordered_ids: (string | number)[]) => {
  return await fetch(`${API_URL}/skills/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({ ordered_ids }),
  });
};

export const updateSkillCategory = async (token: string, oldName: string, newName: string) => {
  return await fetch(`${API_URL}/skills/categories/${encodeURIComponent(oldName)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({ newName }),
  });
};

export const deleteSkillCategory = async (token: string, categoryName: string) => {
  return await fetch(`${API_URL}/skills/categories/${encodeURIComponent(categoryName)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};
