import { NextRequest } from "next/server";
import { connectMongo, isMongoConfigured } from "@/lib/mongodb";
import { Book, Category, Author } from "@/models";

export const dynamic = "force-dynamic";

async function guard() {
  if (!isMongoConfigured()) {
    return Response.json({ ok: false, error: "MongoDB is not configured" }, { status: 400 });
  }
  await connectMongo();
  return null;
}

function normalize(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  
  if (body.title !== undefined) out.title = body.title;
  if (body.isbn !== undefined) out.isbn = body.isbn || "";
  if (body.cover !== undefined) out.coverUrl = body.cover;
  if (body.coverUrl !== undefined) out.coverUrl = body.coverUrl;
  if (body.author !== undefined) out.authorName = body.author;
  if (body.category !== undefined) out.categoryName = body.category;
  if (body.publisher !== undefined) out.publisher = body.publisher;
  if (body.year !== undefined) out.year = body.year ? Number(body.year) : undefined;
  if (body.totalCopies !== undefined) out.totalCopies = Number(body.totalCopies);
  if (body.availableCopies !== undefined) out.availableCopies = Number(body.availableCopies);
  if (body.status !== undefined) out.status = body.status;
  if (body.description !== undefined) out.description = body.description;
  if (body.source !== undefined) out.source = body.source;
  if (body.donatedBy !== undefined) out.donatedBy = body.donatedBy;
  
  // Auto-calculate status based on available copies
  if (out.availableCopies !== undefined) {
    const available = Number(out.availableCopies);
    out.status = available === 0 ? "unavailable" : available < 5 ? "low_stock" : "available";
  }
  
  return out;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return g;
  
  try {
    const { id } = await ctx.params;
    const book = await Book.findById(id).lean();
    
    if (!book) {
      return Response.json({ ok: false, error: "Book not found" }, { status: 404 });
    }
    
    const transformedBook = {
      id: book._id,
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
    
    return Response.json({ ok: true, data: transformedBook });
  } catch (error) {
    return Response.json(
      { ok: false, error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return g;
  
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const update = normalize(body);
    
    // If category is being updated, find or create the category
    if (body.category) {
      let category = await Category.findOne({ name: body.category });
      if (!category) {
        category = await Category.create({ 
          name: body.category,
          description: `Auto-created category: ${body.category}`,
          color: "primary"
        });
      }
      update.categoryId = category._id;
    }
    
    // If author is being updated, find or create the author
    if (body.author) {
      let author = await Author.findOne({ name: body.author });
      if (!author) {
        author = await Author.create({ 
          name: body.author,
          nationality: "",
          bio: ""
        });
      }
      update.authorId = author._id;
    }
    
    const book = await Book.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    
    if (!book) {
      return Response.json({ ok: false, error: "Book not found" }, { status: 404 });
    }
    
    const transformedBook = {
      id: book._id,
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
    
    return Response.json({ ok: true, data: transformedBook });
  } catch (error) {
    return Response.json(
      { ok: false, error: "Failed to update book" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g) return g;
  
  try {
    const { id } = await ctx.params;
    const book = await Book.findByIdAndDelete(id);
    
    if (!book) {
      return Response.json({ ok: false, error: "Book not found" }, { status: 404 });
    }
    
    return Response.json({ ok: true, message: "Book deleted successfully" });
  } catch (error) {
    return Response.json(
      { ok: false, error: "Failed to delete book" },
      { status: 500 }
    );
  }
}