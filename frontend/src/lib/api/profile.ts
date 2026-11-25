import type { Profile } from '@/types';

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

/**
 * Strips hidden assets (hero photos & CV links) from the profile object
 * before serializing it into public RSC payloads or passing it to public
 * Client Components, so disabled images/CVs never leak into HTML or get
 * crawled by Googlebot. Admin panel continues using raw `getProfile()`.
 */
export const sanitizePublicProfile = (profile: Profile | null): Profile | null => {
  if (!profile?.about) return profile;

  const isPhotoVisible = profile.about.show_profile_picture !== false;
  const isResumeVisible = profile.about.show_resume_button !== false;

  return {
    ...profile,
    about: {
      ...profile.about,
      hero_photos: isPhotoVisible ? profile.about.hero_photos : [],
      hero_photo_urls: isPhotoVisible ? profile.about.hero_photo_urls : [],
      cv_path: isResumeVisible ? profile.about.cv_path : undefined,
      cv_url: isResumeVisible ? profile.about.cv_url : undefined,
    },
  };
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
