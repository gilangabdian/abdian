import { Metadata } from 'next';
import { getAllCertificates } from '@/lib/api/certificate';
import AllCertificatesClient from '@/components/public/certificate/AllCertificatesClient';

export const metadata: Metadata = {
  title: 'All Certificates - Abdian',
  description: 'Certificates that I got about topics that interest me.',
};

export default async function CertificatesPage() {
  const certificates = await getAllCertificates();

  return <AllCertificatesClient initialCertificates={certificates} />;
}
