import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";


export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const isAuthRoute = request.nextUrl.pathname.startsWith("/");

  if (!user && !isAuthRoute) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/inventory", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};