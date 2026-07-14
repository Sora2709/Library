import { connectMongo, isMongoConfigured } from "@/lib/mongodb";
import { Book, Member, Category, Author, BorrowRecord } from "@/models";

export type BookDTO = {
  id: string | number;
  title: string;
  isbn: string;
  author: string;
  category: string;
  publisher: string;
  year: number;
  totalCopies: number;
  availableCopies: number;
  status: string;
  cover: string;
  source?: string;      // Added
  donatedBy?: string;
};

export type MemberDTO = {
  id: string | number;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: string;
  department: string;
  year: string;
  status: string;
  borrowedCount: number;
  returnedCount: number;
  joinedAt: string;
};

async function withMongo<T>(fn: () => Promise<T>, empty: T): Promise<T> {
  if (!isMongoConfigured()) return empty;
  try {
    await connectMongo();
    return await fn();
  } catch (err) {
    console.error("[Mongo] error:", (err as Error).message);
    return empty;
  }
}

/* ---------------- Books ---------------- */
export async function getBooks(): Promise<BookDTO[]> {
  return withMongo<BookDTO[]>(async () => {
    const docs = await Book.find().sort({ createdAt: -1 }).lean();
    return docs.map((d) => ({
      id: String(d._id),
      title: d.title,
      isbn: d.isbn ?? "",
      author: d.authorName ?? "",
      category: d.categoryName ?? "",
      publisher: d.publisher ?? "",
      year: d.year ?? 0,
      totalCopies: d.totalCopies ?? 0,
      availableCopies: d.availableCopies ?? 0,
      status: d.status ?? "available",
      cover: d.coverUrl ?? "",
      source: (d as any).source ?? "",        
      donatedBy: (d as any).donatedBy ?? "",
    }));
  }, []);
}

/* ---------------- Members ---------------- */
export async function getMembers(): Promise<MemberDTO[]> {
  return withMongo<MemberDTO[]>(async () => {
    const docs = await Member.find().sort({ createdAt: -1 }).lean();
    return docs.map((d) => ({
      id: String(d._id),
      memberId: d.memberId,
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email ?? "",
      phone: d.phone ?? "",
      type: d.type ?? "student",
      department: d.department ?? "",
      year: d.year ?? "",
      status: d.status ?? "active",
      borrowedCount: d.borrowedCount ?? 0,
      returnedCount: d.returnedCount ?? 0,
      joinedAt: d.joinedAt ? new Date(d.joinedAt).toISOString() : new Date().toISOString(),
    }));
  }, []);
}

/* ---------------- Categories ---------------- */
export async function getCategories() {
  return withMongo(async () => {
    const docs = await Category.find().sort({ createdAt: 1 }).lean();
    return docs.map((d) => ({
      id: String(d._id),
      name: d.name,
      description: (d as unknown as Record<string, string>).description ?? "",
      color: d.color ?? "primary",
      bookCount: 0,
      activeBorrows: 0,
    }));
  }, []) as Promise<{ id: string; name: string; description: string; color: string; bookCount: number; activeBorrows: number }[]>;
}

/* ---------------- Authors ---------------- */
export async function getAuthors() {
  return withMongo(async () => {
    const docs = await Author.find().sort({ name: 1 }).lean();
    return docs.map((d) => ({
      id: String(d._id),
      name: d.name,
      nationality: d.nationality ?? "",
      booksCount: 0,
      totalBorrows: 0,
    }));
  }, []) as Promise<{ id: string; name: string; nationality: string; booksCount: number; totalBorrows: number }[]>;
}

/* ---------------- Borrow Records ---------------- */
export async function getBorrowRecords() {
  return withMongo(async () => {
    const docs = await BorrowRecord.find().sort({ createdAt: -1 }).lean();
    return docs.map((d) => ({
      id: String(d._id),
      bookTitle: d.bookTitle ?? "",
      memberName: d.memberName ?? "",
      memberId: d.memberCode ?? "",
      borrowDate: d.borrowDate ? new Date(d.borrowDate).toISOString() : "",
      dueDate: d.dueDate ? new Date(d.dueDate).toISOString() : "",
      returnDate: d.returnDate ? new Date(d.returnDate).toISOString() : null,
      status: d.status ?? "borrowed",
    }));
  }, []) as Promise<{ id: string; bookTitle: string; memberName: string; memberId: string; borrowDate: string; dueDate: string; returnDate: string | null; status: string }[]>;
}

/* ---------------- Dashboard stats ---------------- */
export async function getDashboardStats() {
  return withMongo(async () => {
    const [totalBooks, totalMembers, activeBorrows, overdue] = await Promise.all([
      Book.countDocuments(),
      Member.countDocuments({ status: "active" }),
      BorrowRecord.countDocuments({ status: "borrowed" }),
      BorrowRecord.countDocuments({ status: "overdue" }),
    ]);
    const availableAgg = await Book.aggregate([
      { $group: { _id: null, total: { $sum: "$availableCopies" } } },
    ]);
    const available = availableAgg[0]?.total ?? 0;
    return {
      totalBooks,
      availableBooks: available,
      borrowedBooks: activeBorrows,
      activeMembers: totalMembers,
      overdueBooks: overdue,
    };
  }, { totalBooks: 0, availableBooks: 0, borrowedBooks: 0, activeMembers: 0, overdueBooks: 0 });
}
