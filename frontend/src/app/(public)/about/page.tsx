import { Metadata } from 'next';
import { getProfile } from '@/lib/api/profile';
import AboutClient from '@/components/public/about/AboutClient';

export const metadata: Metadata = {
  title: 'About - Gilang Abdian',
  description: 'About Gilang Abdian Anggara.',
};

export default async function AboutPage() {
  const profile = await getProfile();

  return <AboutClient initialProfile={profile} />;
}
