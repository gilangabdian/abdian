import { AdminLoginPayload, AdminLoginResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const adminLogin = async (payload: AdminLoginPayload): Promise<AdminLoginResponse> => {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  const responseBody = await res.json();

  if (!res.ok) {
    throw new Error(responseBody.errors || responseBody.message || 'Login failed');
  }
  
  return responseBody;
};

export const adminLogout = async (token: string) => {
  return await fetch(`${API_URL}/admin/logout`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};
