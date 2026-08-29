import { Suspense } from 'react';
import AuthPage from '../auth/page';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFCF9]" />}>
      <AuthPage />
    </Suspense>
  );
}
