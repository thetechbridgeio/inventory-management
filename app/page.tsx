// app/login/page.tsx

import { LoginForm } from "@/features/auth/components/login-form"

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  )
}
