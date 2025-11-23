'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Check if this is a model detail route
    const path = window.location.pathname;
    if (path.startsWith('/model/') && path !== '/model/_placeholder') {
      // Redirect to the placeholder page which will handle the routing client-side
      router.replace('/model/_placeholder' + window.location.search + window.location.hash);
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600">The page you're looking for doesn't exist.</p>
    </div>
  );
}
