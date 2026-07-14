import { NextRequest } from "next/server";
import { connectMongo, isMongoConfigured } from "@/lib/mongodb";
import { Author } from "@/models";

export const dynamic = "force-dynamic";

async function guard() {
  if (!isMongoConfigured()) {
    return Response.json({ ok: false, error: "MongoDB is not configured" }, { status: 400 });
  }
  await connectMongo();
  return null;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return g;
  const { id } = await ctx.params;
  const body = await req.json();
  const doc = await Author.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
  if (!doc) return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  return Response.json({ ok: true, data: doc });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return g;
  const { id } = await ctx.params;
  await Author.findByIdAndDelete(id);
  return Response.json({ ok: true });
}
