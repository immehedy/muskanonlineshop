// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { dbConnect } from "@/lib/database";
import User from "@/lib/models/User";

const COOKIE_NAME = "muskan-token";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await AuthService.verifyToken(token);

  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();

  const users = await User.find({})
    .select("_id name email role createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    users: users.map((user: any) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })),
  });
}