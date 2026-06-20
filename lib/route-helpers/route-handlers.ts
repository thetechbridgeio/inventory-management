import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./errors";

export function createRouteHandler<T>(
  handler: (request: NextRequest) => Promise<T>,
) {
  return async (request: NextRequest) => {
    try {
      const result = await handler(request);

      return NextResponse.json(
        {
          success: true,
          data: result,
        },
        { status: 200 },
      );
    } catch (error) {
      console.error(error);

      if (error instanceof AppError) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          {
            status: error.statusCode,
          },
        );
      }

      if (error instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          {
            status: 500,
          },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Internal Server Error",
        },
        {
          status: 500,
        },
      );
    }
  };
}