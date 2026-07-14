import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  date,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const authors = pgTable("authors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  bio: text("bio"),
  birthYear: integer("birth_year"),
  nationality: varchar("nationality", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  isbn: varchar("isbn", { length: 20 }).unique(),
  coverUrl: text("cover_url"),
  categoryId: integer("category_id").references(() => categories.id),
  authorId: integer("author_id").references(() => authors.id),
  publisher: varchar("publisher", { length: 200 }),
  year: integer("year"),
  totalCopies: integer("total_copies").notNull().default(1),
  availableCopies: integer("available_copies").notNull().default(1),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("available"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  memberId: varchar("member_id", { length: 20 }).notNull().unique(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).unique(),
  phone: varchar("phone", { length: 20 }),
  type: varchar("type", { length: 20 }).notNull().default("student"),
  department: varchar("department", { length: 100 }),
  year: varchar("year", { length: 20 }),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  joinedAt: date("joined_at").defaultNow(),
  avatarUrl: text("avatar_url"),
});

export const borrowRecords = pgTable("borrow_records", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => books.id),
  memberId: integer("member_id").notNull().references(() => members.id),
  borrowDate: date("borrow_date").notNull().defaultNow(),
  dueDate: date("due_date").notNull(),
  returnDate: date("return_date"),
  status: varchar("status", { length: 20 }).notNull().default("borrowed"),
  createdAt: timestamp("created_at").defaultNow(),
});
