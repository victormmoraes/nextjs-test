'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.replace('/last-updates');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show nothing while determining auth state and redirecting
  return null;
}
