import { Metadata } from 'next';
import { getAllProjects } from '@/lib/api/project';
import AllProjectsClient from '@/components/public/project/AllProjectsClient';

export const metadata: Metadata = {
  title: 'All Projects - Abdian',
  description: 'Projects that I created.',
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return <AllProjectsClient initialProjects={projects} />;
}
