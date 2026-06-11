import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { ROLES } from "../../auth/constants/user-role";

export function parseUserQueryParams(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page")) || DEFAULT_PAGE;
  const search = searchParams.get("search") || undefined;
  const roleParam = searchParams.get("role");
  const role = Object.values(ROLES).find((value) => value === roleParam);
  const isActiveParam = searchParams.get("isActive");
  const isActive =
    isActiveParam === null ? undefined : isActiveParam === "true";
  return {
    page,
    search,
    role,
    isActive,
  };
}
