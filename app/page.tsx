import { LoginForm } from "@/features/auth/components/login-form";
import { AuthActionProvider } from "@/features/auth/contexts/auth.context";
import React from "react";

const MainPage = () => {
  return (
    <AuthActionProvider>
      <main className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>
    </AuthActionProvider>
  );
};

export default MainPage;
