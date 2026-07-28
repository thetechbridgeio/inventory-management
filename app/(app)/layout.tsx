import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { AuthenticationError } from "@/lib/errors/authentication-error";
import { AuthorizationError } from "@/lib/errors/authorization-error";
import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/features/auth/providers/use-auth.provider";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { Sidebar } from "@/components/layout/sidebar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  let user;

  try {
    user = await getCurrentUser();
  } catch (error) {
    if (error instanceof AuthenticationError) redirect("/");
    if (error instanceof AuthorizationError) redirect("/unauthorized");
    throw error;
  }
  return (
    <AuthProvider initialUser={user}>
      <div className="h-screen overflow-hidden bg-[#f6f7fb]">
        <Sidebar />

        <div className="ml-72.5 flex h-full flex-col">
          <Header />

          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}