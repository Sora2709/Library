import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { connectMongo, isMongoConfigured } from "@/lib/mongodb";
import { AppUser } from "@/models";
import { AUTH_COOKIE, createSessionToken, initials } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isMongoConfigured()) {
    return NextResponse.json({ ok: false, error: "MongoDB is not configured." }, { status: 503 });
  }
  try {
    await connectMongo();
    const count = await AppUser.countDocuments();
    return NextResponse.json({ ok: true, data: { setupRequired: count === 0 } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ ok: false, error: "MongoDB is not configured." }, { status: 503 });
  }

  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email || password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Name, email, and a password of at least 8 characters are required." },
        { status: 400 }
      );
    }

    await connectMongo();
    const count = await AppUser.countDocuments();
    if (count > 0) {
      return NextResponse.json(
        { ok: false, error: "An administrator already exists. Please sign in." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await AppUser.create({
      name,
      email,
      passwordHash,
      role: "Head Librarian",
      avatar: initials(name),
      active: true,
      lastLoginAt: new Date(),
    });

    const publicUser = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };
    const token = await createSessionToken(publicUser);
    const response = NextResponse.json({ ok: true, data: publicUser }, { status: 201 });
    response.cookies.set({
      name: AUTH_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    const message = (error as Error).message;
    const isDuplicate = message.includes("duplicate key");
    return NextResponse.json(
      { ok: false, error: isDuplicate ? "That email is already in use." : message || "Unable to create administrator." },
      { status: 500 }
    );
  }
}
