"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea, Label } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { CATEGORY_OPTIONS, type Book } from "@/lib/types";

export interface BookFormData {
  title: string;
  isbn: string;
  author: string;
  category: string;
  publisher: string;
  year: string;
  totalCopies: string;
  cover: string;
  description: string;
}

export function emptyBookForm(): BookFormData {
  return {
    title: "",
    isbn: "",
    author: "",
    category: "",
    publisher: "",
    year: "",
    totalCopies: "1",
    cover: "",
    description: "",
  };
}

export function bookToForm(book: Book): BookFormData {
  return {
    title: book.title ?? "",
    isbn: book.isbn ?? "",
    author: book.author ?? "",
    category: book.category ?? "",
    publisher: book.publisher ?? "",
    year: book.year ? String(book.year) : "",
    totalCopies: book.totalCopies != null ? String(book.totalCopies) : "1",
    cover: book.cover ?? "",
    description: book.description ?? "",
  };
}

interface BookFormProps {
  initial: BookFormData;
  onSubmit: (data: BookFormData) => Promise<void> | void;
  submitLabel: string;
  submitting?: boolean;
}

export function BookForm({ initial, onSubmit, submitLabel, submitting }: BookFormProps) {
  const [form, setForm] = useState<BookFormData>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof BookFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.isbn.trim()) e.isbn = "ISBN is required";
    if (!form.author.trim()) e.author = "Author is required";
    if (!form.category) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} id="book-form" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Title *</Label>
          <Input
            placeholder="Book title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>
        <div>
          <Label>ISBN *</Label>
          <Input
            placeholder="978-..."
            value={form.isbn}
            onChange={(e) => set("isbn", e.target.value)}
          />
          {errors.isbn && <p className="text-xs text-red-500 mt-1">{errors.isbn}</p>}
        </div>
        <div>
          <Label>Author *</Label>
          <Input
            placeholder="Author name"
            value={form.author}
            onChange={(e) => set("author", e.target.value)}
          />
          {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author}</p>}
        </div>
        <div>
          <Label>Category *</Label>
          <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
            <option value="">Select category</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
        </div>
        <div>
          <Label>Publisher</Label>
          <Input
            placeholder="Publisher name"
            value={form.publisher}
            onChange={(e) => set("publisher", e.target.value)}
          />
        </div>
        <div>
          <Label>Publication Year</Label>
          <Input
            type="number"
            placeholder="2024"
            value={form.year}
            onChange={(e) => set("year", e.target.value)}
          />
        </div>
        <div>
          <Label>Total Copies *</Label>
          <Input
            type="number"
            min="0"
            placeholder="1"
            value={form.totalCopies}
            onChange={(e) => set("totalCopies", e.target.value)}
          />
        </div>
        <div>
          <Label>Cover Image</Label>
          <ImageUpload value={form.cover} onChange={(v) => set("cover", v)} />
        </div>
        <div className="md:col-span-2">
          <Label>Description</Label>
          <Textarea
            rows={3}
            placeholder="Book description..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
      </div>
      {/* Hidden submit so the footer button (form attribute) can trigger it */}
      <button type="submit" className="hidden" disabled={submitting} aria-hidden>
        {submitLabel}
      </button>
    </form>
  );
}
