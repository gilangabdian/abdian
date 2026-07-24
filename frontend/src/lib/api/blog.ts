import { Blog } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAllBlogs = async (queryParams: Record<string, string> = {}): Promise<Blog[]> => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${API_URL}/blogs${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url, {
      next: { revalidate: 60, tags: ['blogs'] },
    });
    if (!res.ok) return [];
    const responseData = await res.json();
    return Array.isArray(responseData) ? responseData : (responseData.data || []);
  } catch (error) {
    console.error('Failed to fetch blogs', error);
    return [];
  }
};

export const getBlogBySlug = async (slug: string): Promise<Blog | null> => {
  try {
    const res = await fetch(`${API_URL}/blogs/${slug}`, {
      next: { revalidate: 60, tags: ['blogs', `blog-${slug}`] },
    });
    if (!res.ok) return null;
    const responseData = await res.json();
    return responseData.data !== undefined ? responseData.data : responseData;
  } catch (error) {
    console.error('Failed to fetch blog by slug', error);
    return null;
  }
};

export const getBlogById = async (id: string | number): Promise<Blog | null> => {
  try {
    const res = await fetch(`${API_URL}/blogs/${id}`, {
      next: { revalidate: 60, tags: ['blogs', `blog-${id}`] },
    });
    if (!res.ok) return null;
    const responseData = await res.json();
    return responseData.data !== undefined ? responseData.data : responseData;
  } catch (error) {
    console.error('Failed to fetch blog by id', error);
    return null;
  }
};

export const getAllBlogsAdmin = async (token: string): Promise<Blog[]> => {
  try {
    const res = await fetch(`${API_URL}/admin/blogs`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      // Admin APIs usually shouldn't be cached aggressively
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const responseData = await res.json();
    return Array.isArray(responseData) ? responseData : (responseData.data || []);
  } catch (error) {
    console.error('Failed to fetch admin blogs', error);
    return [];
  }
};

export const getBlogByIdAdmin = async (token: string, id: string | number): Promise<Blog | null> => {
  try {
    const res = await fetch(`${API_URL}/admin/blogs/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const responseData = await res.json();
    return responseData.data !== undefined ? responseData.data : responseData;
  } catch (error) {
    console.error('Failed to fetch admin blog by id', error);
    return null;
  }
};

export const createBlog = async (token: string, formData: FormData) => {
  return await fetch(`${API_URL}/blogs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });
};

export const updateBlog = async (token: string, id: string | number, formData: FormData) => {
  return await fetch(`${API_URL}/blogs/${id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });
};

export const deleteBlog = async (token: string, id: string | number) => {
  return await fetch(`${API_URL}/blogs/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};

export const uploadBlogImage = async (token: string, formData: FormData) => {
  return await fetch(`${API_URL}/blogs/upload-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: formData,
  });
};
