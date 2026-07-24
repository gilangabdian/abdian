import { Metadata } from 'next';
import { getAllContacts } from '@/lib/api/contact';
import AllContactsClient from '@/components/public/contact/AllContactsClient';

export const metadata: Metadata = {
  title: 'Contacts - Gilang Abdian',
  description: 'Find me on social media.',
};

export default async function ContactsPage() {
  const contacts = await getAllContacts();

  return <AllContactsClient initialContacts={contacts} />;
}
