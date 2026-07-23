import { Certificate } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAllCertificates = async (queryParams: Record<string, string> = {}): Promise<Certificate[]> => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${API_URL}/certificates${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      next: { revalidate: 60, tags: ['certificates'] },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch certificates', error);
    return [];
  }
};

export const getSingleCertificate = async (id: string | number): Promise<Certificate | null> => {
  try {
    const res = await fetch(`${API_URL}/certificates/${id}`, {
      next: { revalidate: 60, tags: ['certificates', `certificate-${id}`] },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch certificate', error);
    return null;
  }
};

export const adminUploadCertificate = async (token: string, formData: FormData) => {
  return await fetch(`${API_URL}/certificates`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });
};

export const adminUpdateCertificate = async (token: string, id: string | number, formData: FormData) => {
  return await fetch(`${API_URL}/certificates/${id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });
};

export const adminDeleteCertificate = async (token: string, id: string | number) => {
  return await fetch(`${API_URL}/certificates/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};

export const reorderCertificates = async (token: string, ordered_ids: (string | number)[]) => {
  return await fetch(`${API_URL}/certificates/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({ ordered_ids }),
  });
};
