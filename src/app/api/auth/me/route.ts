import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";

export const runtime = "nodejs";

const COOKIE_NAME = "muskan-token";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      {
        error: "No token cookie found",
        cookiesSeen: request.cookies.getAll().map((c) => c.name),
      },
      { status: 401 }
    );
  }

  try {
    const user = await AuthService.verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to get current user",
        message: error?.message,
      },
      { status: 500 }
    );
  }
}