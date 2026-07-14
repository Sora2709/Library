import { NextRequest, NextResponse } from "next/server";
import { connectMongo, isMongoConfigured } from "@/lib/mongodb";
import { AppUser } from "@/models";
import { readSessionToken, AUTH_COOKIE, initials } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json(
      { ok: false, error: "MongoDB is not configured." },
      { status: 503 }
    );
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE);
    
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await readSessionToken(token.value);
    
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    await connectMongo();
    const user = await AppUser.findById(session.id);
    
    if (!user || !user.active) {
      // Clear invalid session
      const response = NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 401 }
      );
      response.cookies.delete(AUTH_COOKIE);
      return response;
    }

    // Update avatar if needed
    const avatar = user.avatar || initials(user.name);

    return NextResponse.json({
      ok: true,
      data: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role || "Librarian",
        avatar: avatar,
      }
    });

  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { ok: false, error: "Authentication failed" },
      { status: 401 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json(
      { ok: false, error: "MongoDB is not configured." },
      { status: 503 }
    );
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE);
    
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await readSessionToken(token.value);
    
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Invalid session" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email } = body;

    if (!name && !email) {
      return NextResponse.json(
        { ok: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    await connectMongo();
    
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (name) updateData.avatar = initials(name);

    const user = await AppUser.findByIdAndUpdate(
      session.id,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    const avatar = user.avatar || initials(user.name);

    return NextResponse.json({
      ok: true,
      data: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role || "Librarian",
        avatar: avatar,
      },
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { ok: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}