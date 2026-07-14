import { NextRequest } from "next/server";
import { connectMongo, isMongoConfigured } from "@/lib/mongodb";
import { BorrowRecord, Book, Member } from "@/models";
import { getBorrowRecords } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const records = await getBorrowRecords();
  return Response.json({
    ok: true,
    data: records,
    source: isMongoConfigured() ? "mongodb" : "mock",
  });
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
    const book = await Book.findById(body.bookId);
    const member = await Member.findById(body.memberId);
    if (!book || !member) {
      return Response.json({ ok: false, error: "Book or member not found" }, { status: 404 });
    }
    if (book.availableCopies <= 0) {
      return Response.json({ ok: false, error: "No copies available" }, { status: 400 });
    }

    const borrowDate = body.borrowDate ? new Date(body.borrowDate) : new Date();
    const dueDate = body.dueDate
      ? new Date(body.dueDate)
      : new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    const record = await BorrowRecord.create({
      bookId: book._id,
      memberId: member._id,
      bookTitle: book.title,
      memberName: `${member.firstName} ${member.lastName}`,
      memberCode: member.memberId,
      borrowDate,
      dueDate,
      status: "borrowed",
    });

    book.availableCopies = Math.max(0, book.availableCopies - 1);
    if (book.availableCopies === 0) book.status = "unavailable";
    else if (book.availableCopies < 5) book.status = "low_stock";
    await book.save();

    member.borrowedCount = (member.borrowedCount ?? 0) + 1;
    await member.save();

    return Response.json({ ok: true, data: { id: String(record._id) } }, { status: 201 });
  } catch (err) {
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
