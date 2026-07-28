// src/models/index.ts
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/* ---------------- Application User ---------------- */
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, default: "Librarian" },
    avatar: { type: String, default: "LU" },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);
export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export const AppUser: Model<UserDoc> =
  (mongoose.models.AppUser as Model<UserDoc>) ||
  mongoose.model<UserDoc>("AppUser", userSchema);

/* ---------------- Category ---------------- */
const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    color: { type: String, default: "primary" },
  },
  { timestamps: true }
);
export type CategoryDoc = InferSchemaType<typeof categorySchema> & { _id: mongoose.Types.ObjectId };
export const Category: Model<CategoryDoc> =
  (mongoose.models.Category as Model<CategoryDoc>) ||
  mongoose.model<CategoryDoc>("Category", categorySchema);

/* ---------------- Author ---------------- */
const authorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    bio: { type: String, default: "" },
    birthYear: { type: Number },
    nationality: { type: String, default: "" },
    bookCount: { type: Number, default: 0 }, // ✅ Track how many books this author has
  },
  { timestamps: true }
);
export type AuthorDoc = InferSchemaType<typeof authorSchema> & { _id: mongoose.Types.ObjectId };
export const Author: Model<AuthorDoc> =
  (mongoose.models.Author as Model<AuthorDoc>) ||
  mongoose.model<AuthorDoc>("Author", authorSchema);

/* ---------------- Book ---------------- */
const bookSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    isbn: { type: String, unique: true, sparse: true, trim: true },
    coverUrl: { type: String, default: "" },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    authorId: { type: Schema.Types.ObjectId, ref: "Author" },
    // denormalized for fast list rendering
    categoryName: { type: String, default: "" },
    authorName: { type: String, default: "" },
    publisher: { type: String, default: "" },
    year: { type: Number },
    totalCopies: { type: Number, default: 1, min: 0 },
    availableCopies: { type: Number, default: 1, min: 0 },
    description: { type: String, default: "" },
    source: { type: String, default: "" },        // Purchase, Donation, Other
    donatedBy: { type: String, default: "" }, 
    status: {
      type: String,
      enum: ["available", "low_stock", "unavailable"],
      default: "available",
    },
  },
  { timestamps: true }
);
export type BookDoc = InferSchemaType<typeof bookSchema> & { _id: mongoose.Types.ObjectId };
export const Book: Model<BookDoc> =
  (mongoose.models.Book as Model<BookDoc>) || mongoose.model<BookDoc>("Book", bookSchema);

/* ---------------- Member ---------------- */
const memberSchema = new Schema(
  {
    memberId: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    type: { type: String, enum: ["student", "faculty"], default: "student" },
    department: { type: String, default: "" },
    year: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "suspended", "expired"],
      default: "active",
    },
    joinedAt: { type: Date, default: Date.now },
    avatarUrl: { type: String, default: "" },
    borrowedCount: { type: Number, default: 0 },
    returnedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export type MemberDoc = InferSchemaType<typeof memberSchema> & { _id: mongoose.Types.ObjectId };
export const Member: Model<MemberDoc> =
  (mongoose.models.Member as Model<MemberDoc>) ||
  mongoose.model<MemberDoc>("Member", memberSchema);

/* ---------------- BorrowRecord ---------------- */
const borrowRecordSchema = new Schema(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    bookTitle: { type: String, default: "" },
    memberName: { type: String, default: "" },
    memberCode: { type: String, default: "" },
    borrowDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["borrowed", "returned", "overdue"],
      default: "borrowed",
    },
  },
  { timestamps: true }
);
export type BorrowRecordDoc = InferSchemaType<typeof borrowRecordSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const BorrowRecord: Model<BorrowRecordDoc> =
  (mongoose.models.BorrowRecord as Model<BorrowRecordDoc>) ||
  mongoose.model<BorrowRecordDoc>("BorrowRecord", borrowRecordSchema);