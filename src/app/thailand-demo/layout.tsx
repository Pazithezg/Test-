import { redirect } from 'next/navigation';

export default function ThailandDemoLayout({ children }: { children: React.ReactNode }) {
  redirect('/');
  return children;
}
