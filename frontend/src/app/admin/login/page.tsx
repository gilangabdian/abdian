import { Metadata } from 'next';
import LoginClient from '@/components/admin/login/LoginClient';

export const metadata: Metadata = {
  title: 'Admin Login - Gilang Abdian',
  description: 'Admin login for Gilang Abdian portfolio.',
};

export default function AdminLoginPage() {
  return <LoginClient />;
}
