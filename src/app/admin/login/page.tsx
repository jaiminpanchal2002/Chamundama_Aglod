import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="text-3xl text-temple-gold">ॐ</span>
          <h1 className="mt-2 font-display text-xl text-slate-900">
            Shree Chamunda Dham
          </h1>
          <p className="text-sm text-slate-500">Trust Administration</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
