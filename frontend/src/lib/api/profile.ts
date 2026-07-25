import { Profile } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getProfile = async (): Promise<Profile | null> => {
  try {
    const res = await fetch(`${API_URL}/profile`, {
      next: { revalidate: 60, tags: ['profile'] },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (error) {
    console.error('Failed to fetch profile', error);
    return null;
  }
};

export const saveProfile = async (token: string, formData: FormData) => {
  return await fetch(`${API_URL}/profile`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });
};
