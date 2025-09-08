import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import DemoClient from './DemoClient';

export default async function DemoPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');
  return <DemoClient />;
}
