import { requireAccess } from "@/features/auth/hooks/require-access";

export default async function ReturnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAccess("returns");

  return children;
}
