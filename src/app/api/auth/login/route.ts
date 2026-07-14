import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { connectMongo, isMongoConfigured } from "@/lib/mongodb";
import { AppUser } from "@/models";
import { AUTH_COOKIE, createSessionToken, initials } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json(
      { ok: false, error: "MongoDB is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectMongo();
    const user = await AppUser.findOne({ email }).select("+passwordHash");

    if (!user || !user.active) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const publicUser = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role || "Librarian",
      avatar: user.avatar || initials(user.name),
    };
    
    const token = await createSessionToken(publicUser);

    const response = NextResponse.json({ 
      ok: true, 
      data: publicUser,
      message: "Login successful" 
    });
    
    response.cookies.set({
      name: AUTH_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message || "Unable to sign in." },
      { status: 500 }
    );
  }
}