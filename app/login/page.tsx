import { Suspense } from 'react';
import { LoginPage } from '@/components/ui/pages/LoginPage';
import { Spinner } from '@/components/ui/atoms/Spinner';

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
