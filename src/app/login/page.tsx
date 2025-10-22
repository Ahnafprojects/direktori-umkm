// File: src/app/login/page.tsx

import LoginForm from '../_components/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}