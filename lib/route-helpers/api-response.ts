import { NextResponse } from "next/server";

export function apiResponse<T>(
  data: T,
  status = 200,
) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  );
}