import { Metadata } from 'next';
import ProjectFormClient from '@/components/admin/projects/ProjectFormClient';

export const metadata: Metadata = {
  title: 'Add Project - Admin',
  description: 'Add a new project.',
};

export default function AdminProjectCreatePage() {
  return <ProjectFormClient isEditMode={false} />;
}
