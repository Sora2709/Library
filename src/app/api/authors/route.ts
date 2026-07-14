import { NextRequest } from "next/server";
import { connectMongo, isMongoConfigured } from "@/lib/mongodb";
import { Author } from "@/models";
import { getAuthors } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getAuthors();
  return Response.json({ ok: true, data, source: isMongoConfigured() ? "mongodb" : "mock" });
}

export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return Response.json({ ok: false, error: "MongoDB is not configured" }, { status: 400 });
  }
  try {
    await connectMongo();
    const body = await req.json();
    const a = await Author.create({
      name: body.name,
      bio: body.bio ?? "",
      birthYear: body.birthYear ? Number(body.birthYear) : undefined,
      nationality: body.nationality ?? "",
    });
    return Response.json({ ok: true, data: { id: String(a._id) } }, { status: 201 });
  } catch (err) {
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
