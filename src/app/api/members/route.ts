import { NextRequest } from "next/server";
import { connectMongo, isMongoConfigured } from "@/lib/mongodb";
import { Member } from "@/models";
import { getMembers } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const members = await getMembers();
  return Response.json({ ok: true, data: members, source: isMongoConfigured() ? "mongodb" : "mock" });
}

export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return Response.json(
      { ok: false, error: "MongoDB is not configured. Set MONGODB_URI in .env" },
      { status: 400 }
    );
  }
  try {
    await connectMongo();
    const body = await req.json();
    const member = await Member.create({
      memberId: body.memberId ?? `STU-${Date.now()}`,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      type: body.type ?? "student",
      department: body.department,
      year: body.year,
      status: body.status ?? "active",
    });
    return Response.json({ ok: true, data: { id: String(member._id) } }, { status: 201 });
  } catch (err) {
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
