import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard - this handles the /voting/admin route
    router.replace('/voting/admin/dashboard');
  }, [router]);

  return null;
}