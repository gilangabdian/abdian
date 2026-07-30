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
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (error) {
    console.error('Failed to fetch projects', error);
    return [];
  }
};

export const checkProjectsHealth = async () => {
  return await fetch(`${API_URL}/projects`);
};

export const getSingleProject = async (idOrSlug: string | number): Promise<Project | null> => {
  try {
    const res = await fetch(`${API_URL}/projects/${idOrSlug}`, {
      next: { revalidate: 60, tags: ['projects', `project-${idOrSlug}`] },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (error) {
    console.error('Failed to fetch single project', error);
    return null;
  }
};

export const adminUploadProject = async (
  token: string, 
  formData: FormData, 
  onProgress?: (progress: number) => void
): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/projects`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Accept", "application/json");

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      // Resolve using standard Response interface so it matches previous fetch behavior
      const response = new Response(xhr.response, {
        status: xhr.status,
        statusText: xhr.statusText,
      });
      resolve(response);
    };

    xhr.onerror = () => {
      reject(new Error("Network Error"));
    };

    xhr.send(formData);
  });
};

export const adminUpdateProject = async (
  token: string, 
  id: string | number, 
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    // Gunakan POST, dan formData sudah membawa _method=PUT dari form client
    xhr.open("POST", `${API_URL}/projects/${id}`, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Accept", "application/json");

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      const response = new Response(xhr.response, {
        status: xhr.status,
        statusText: xhr.statusText,
      });
      resolve(response);
    };

    xhr.onerror = () => {
      reject(new Error("Network Error"));
    };

    xhr.send(formData);
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

export const adminReorderProjects = async (token: string, orderedIds: number[]) => {
  return await fetch(`${API_URL}/projects/reorder`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ ordered_ids: orderedIds }),
  });
};
