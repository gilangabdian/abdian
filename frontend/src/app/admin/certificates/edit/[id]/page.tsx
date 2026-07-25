import CertificateFormClient from "@/components/admin/certificates/CertificateFormClient";

export const metadata = {
  title: "Edit Certificate | Admin Panel",
};

export default async function EditCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <CertificateFormClient certId={resolvedParams.id} />;
}
