import { Metadata } from "next";
import { getAllCertificates } from "@/lib/api/certificate";
import AllCertificatesClient from "@/components/public/certificate/AllCertificatesClient";

export const metadata: Metadata = {
  title: "Certificates",
  description: "Certificates that I got about topics that interest me.",
};

import { notFound } from "next/navigation";
import { getProfile } from "@/lib/api/profile";

export default async function CertificatesPage() {
  const profile = await getProfile();

  if (profile?.about?.is_certificates_page_active === false) {
    notFound();
  }

  const certificates = await getAllCertificates();

  return <AllCertificatesClient initialCertificates={certificates} />;
}
