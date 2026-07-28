import { requireAccess } from "@/features/auth/hooks/require-access";

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAccess("sales");

  return children;
}