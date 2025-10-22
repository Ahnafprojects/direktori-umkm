// File: src/app/register/page.tsx

import RegisterForm from '../_components/register-form';

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}