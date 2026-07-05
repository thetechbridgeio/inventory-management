import { redirect } from "next/navigation";

import { AuthenticationError } from "@/lib/errors/authentication-error";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default async function AuthLayout({
  children,
}: AuthLayoutProps) {
  try {
    await getCurrentUser();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return children;
    }

    throw error;
  }

  redirect("/inventory");
}