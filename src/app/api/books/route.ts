import { NextRequest } from "next/server";
import { connectMongo, isMongoConfigured } from "@/lib/mongodb";
import { Book, Category, Author } from "@/models";
import { getBooks } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const books = await getBooks();
  return Response.json({ ok: true, data: books, source: isMongoConfigured() ? "mongodb" : "mock" });
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
    
    // Validate required fields
    if (!body.title || !body.author || !body.category) {
      return Response.json(
        { ok: false, error: "Title, author, and category are required." },
        { status: 400 }
      );
    }

    // Find or create category
    let category = await Category.findOne({ name: body.category });
    if (!category) {
      category = await Category.create({ 
        name: body.category,
        description: `Auto-created category: ${body.category}`,
        color: "primary"
      });
    }

    // Find or create author
    let author = await Author.findOne({ name: body.author });
    if (!author) {
      author = await Author.create({ 
        name: body.author,
        nationality: "",
        bio: ""
      });
    }

    const totalCopies = Number(body.totalCopies ?? 1);
    const availableCopies = Number(body.availableCopies ?? totalCopies);
    
    let status: "available" | "low_stock" | "unavailable" = "available";
    if (availableCopies === 0) status = "unavailable";
    else if (availableCopies < 5) status = "low_stock";
    
    const bookData = {
      title: body.title,
      isbn: body.isbn || "",
      coverUrl: body.coverUrl ?? body.cover ?? "",
      categoryId: category._id,
      authorId: author._id,
      categoryName: body.category,
      authorName: body.author,
      publisher: body.publisher || "",
      year: body.year ? Number(body.year) : undefined,
      totalCopies: totalCopies,
      availableCopies: availableCopies,
      description: body.description || "",
      source: body.source || "",
      donatedBy: body.donatedBy || "",
      status: status,
    };

    const book = await Book.create(bookData);

    // Return the created book with all fields
    const transformedBook = {
      id: String(book._id),
      title: book.title || "",
      isbn: book.isbn || "",
      author: book.authorName || "Unknown",
      category: book.categoryName || "Uncategorized",
      publisher: book.publisher || "",
      year: book.year || 0,
      totalCopies: book.totalCopies || 1,
      availableCopies: book.availableCopies || 0,
      cover: book.coverUrl || "",
      description: book.description || "",
      status: book.status || "available",
      source: book.source || "",
      donatedBy: book.donatedBy || "",
    };

    return Response.json({ ok: true, data: transformedBook }, { status: 201 });
    
  } catch (err) {
    return Response.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}