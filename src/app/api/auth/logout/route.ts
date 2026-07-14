import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const response = NextResponse.json({
      ok: true,
      message: "Logged out successfully"
    });
    
    response.cookies.delete(AUTH_COOKIE);
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}