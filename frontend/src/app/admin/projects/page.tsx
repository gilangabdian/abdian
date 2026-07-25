import { Metadata } from 'next';
import ProjectsClient from '@/components/admin/projects/ProjectsClient';

export const metadata: Metadata = {
  title: 'Manage Projects - Admin',
  description: 'Manage your portfolio projects.',
};

export default function AdminProjectsPage() {
  return <ProjectsClient />;
}
