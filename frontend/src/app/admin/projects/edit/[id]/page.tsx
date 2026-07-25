import { Metadata } from 'next';
import ProjectFormClient from '@/components/admin/projects/ProjectFormClient';

export const metadata: Metadata = {
  title: 'Edit Project - Admin',
  description: 'Edit project.',
};

export default async function AdminProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectFormClient isEditMode={true} projectId={id} />;
}
