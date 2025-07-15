import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the dashboard as the default landing page for the demo
  redirect('/dashboard');
  return null; // This component won't render anything as it redirects
}
