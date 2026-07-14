import { NextRequest } from "next/server";
import { connectMongo, isMongoConfigured } from "@/lib/mongodb";
import { BorrowRecord, Book, Member } from "@/models";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!isMongoConfigured()) {
    return Response.json({ ok: false, error: "MongoDB is not configured" }, { status: 400 });
  }
  try {
    await connectMongo();
    const { id } = await ctx.params;
    const record = await BorrowRecord.findById(id);
    if (!record) return Response.json({ ok: false, error: "Not found" }, { status: 404 });

    record.returnDate = new Date();
    record.status = "returned";
    await record.save();

    const book = await Book.findById(record.bookId);
    if (book) {
      book.availableCopies = (book.availableCopies ?? 0) + 1;
      if (book.availableCopies >= 5) book.status = "available";
      else if (book.availableCopies > 0) book.status = "low_stock";
      await book.save();
    }

    const member = await Member.findById(record.memberId);
    if (member) {
      member.borrowedCount = Math.max(0, (member.borrowedCount ?? 0) - 1);
      member.returnedCount = (member.returnedCount ?? 0) + 1;
      await member.save();
    }

    return Response.json({ ok: true, data: { returned: true } });
  } catch (err) {
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
